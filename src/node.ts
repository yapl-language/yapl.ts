import { promises as fs, existsSync } from "node:fs";
import * as path from "node:path";
import type { Prompt, Vars, YAPLOptions } from "./index";
import { YAPL } from "./index";
import { YAPLRenderer } from "./renderer";

export class NodeYAPL extends YAPL {
	private cacheEnabled: boolean;
	private strictPaths: boolean;
	private fileCache: Map<string, string> = new Map();

	constructor(opts: YAPLOptions) {
		super(opts);
		const inputBases = Array.isArray(opts.baseDir)
			? opts.baseDir
			: [opts.baseDir];
		// Configure local base directories and known aliases
		this.baseDirs = inputBases
			.filter((b) => !b.startsWith("@"))
			.map((b) => path.resolve(b));
		// Known alias: @awesome-yapl -> github raw base for prompts folder
		if (inputBases.some((b) => b === "@awesome-yapl")) {
			this.remoteAliases["@awesome-yapl"] =
				"https://raw.githubusercontent.com/yapl-language/awesome-yapl/main/prompts";
		}
		// Use the first local base dir for default baseDir on the renderer
		const baseDir = this.baseDirs[0] ?? process.cwd();
		this.setBaseDir(baseDir);
		this.cacheEnabled = opts.cache !== false;
		this.strictPaths = opts.strictPaths !== false;

		const ensureExt = (p: string) => (p.endsWith(".yapl") ? p : `${p}.yapl`);
		const isUrl = (s: string) => /^https?:\/\//.test(s);

		this.renderer = new YAPLRenderer({
			baseDir,
			strictPaths: this.strictPaths,
			maxDepth: opts.maxDepth,
			whitespace: opts.whitespace,
			resolvePath: (templateRef, fromDir) => {
				const ref = ensureExt(templateRef);
				// Alias to remote URL
				for (const [alias, baseUrl] of Object.entries(this.remoteAliases)) {
					if (ref.startsWith(`${alias}/`)) {
						const rest = ref.slice(alias.length + 1);
						return `${baseUrl}/${rest}`;
					}
				}
				// Absolute URL passthrough
				if (isUrl(ref)) return ref;

				// Relative path (./ or ../) -> resolve against fromDir
				if (ref.startsWith("./") || ref.startsWith("../")) {
					const absolutePath = path.resolve(fromDir, ref);
					if (
						this.strictPaths &&
						!this.baseDirs.some((d) => absolutePath.startsWith(d))
					) {
						throw new Error(`Path escapes baseDir: ${templateRef}`);
					}
					return absolutePath;
				}

				// Root-relative path: search across baseDirs with last one winning
				for (let i = this.baseDirs.length - 1; i >= 0; i--) {
					const baseI = this.baseDirs[i];
					if (!baseI) continue;
					const candidate = path.resolve(baseI, ref);
					if (existsSync(candidate)) return candidate;
				}
				// Fallback to resolving from fromDir
				const absolutePath = path.resolve(fromDir, ref);
				if (
					this.strictPaths &&
					!this.baseDirs.some((d) => absolutePath.startsWith(d))
				) {
					throw new Error(`Path escapes baseDir: ${templateRef}`);
				}
				return absolutePath;
			},
			loadFile: async (absolutePath) => {
				if (this.cacheEnabled && this.fileCache.has(absolutePath)) {
					const cachedContent = this.fileCache.get(absolutePath);
					if (cachedContent !== undefined) return cachedContent;
				}
				if (isUrl(absolutePath)) {
					const res = await fetch(absolutePath);
					if (!res.ok) {
						throw new Error(`Failed to fetch ${absolutePath}: ${res.status}`);
					}
					const text = await res.text();
					if (this.cacheEnabled) this.fileCache.set(absolutePath, text);
					return text;
				}
				const fileContent = await fs.readFile(absolutePath, "utf8");
				if (this.cacheEnabled) this.fileCache.set(absolutePath, fileContent);
				return fileContent;
			},
			ensureExtension: ensureExt,
		});
	}

	async render(templatePath: string, vars: Vars = {}): Promise<Prompt> {
		const ensureExt = (p: string) => (p.endsWith(".yapl") ? p : `${p}.yapl`);
		const ref = ensureExt(templatePath);
		const isUrl = (s: string) => /^https?:\/\//.test(s);
		let absolutePath: string | undefined;
		// Alias support at top-level render
		const aliasEntry = Object.entries(this.remoteAliases).find(([alias]) =>
			ref.startsWith(`${alias}/`),
		);
		if (aliasEntry) {
			const [alias, baseUrl] = aliasEntry;
			const rest = ref.slice(alias.length + 1);
			absolutePath = `${baseUrl}/${rest}`;
		}
		if (!absolutePath) {
			if (ref.startsWith("./") || ref.startsWith("../")) {
				absolutePath = path.resolve(this.baseDirs[0] ?? process.cwd(), ref);
			} else if (isUrl(ref)) {
				absolutePath = ref;
			} else {
				// Search across baseDirs with last one winning
				let found: string | null = null;
				for (let i = this.baseDirs.length - 1; i >= 0; i--) {
					const baseI = this.baseDirs[i];
					if (!baseI) continue;
					const candidate = path.resolve(baseI, ref);
					if (existsSync(candidate)) {
						found = candidate;
						break;
					}
				}
				absolutePath =
					found ?? path.resolve(this.baseDirs[0] ?? process.cwd(), ref);
			}
		}
		if (
			!isUrl(absolutePath) &&
			this.strictPaths &&
			!this.baseDirs.some((d) => (absolutePath ?? "").startsWith(d))
		) {
			throw new Error(`Path escapes baseDir: ${templatePath}`);
		}

		let fileContent: string;
		if (this.cacheEnabled && this.fileCache.has(absolutePath)) {
			const cached = this.fileCache.get(absolutePath);
			if (cached !== undefined) {
				fileContent = cached;
			} else {
				if (isUrl(absolutePath)) {
					const res = await fetch(absolutePath);
					if (!res.ok) {
						throw new Error(`Failed to fetch ${absolutePath}: ${res.status}`);
					}
					fileContent = await res.text();
				} else {
					fileContent = await fs.readFile(absolutePath, "utf8");
				}
				if (this.cacheEnabled) this.fileCache.set(absolutePath, fileContent);
			}
		} else {
			if (isUrl(absolutePath)) {
				const res = await fetch(absolutePath);
				if (!res.ok) {
					throw new Error(`Failed to fetch ${absolutePath}: ${res.status}`);
				}
				fileContent = await res.text();
			} else {
				fileContent = await fs.readFile(absolutePath, "utf8");
			}
			if (this.cacheEnabled) this.fileCache.set(absolutePath, fileContent);
		}
		const result = await this.renderer.renderString(
			fileContent,
			vars,
			path.dirname(absolutePath),
		);
		return {
			content: result.content,
			usedFiles: Array.from(new Set([absolutePath, ...result.usedFiles])),
		};
	}
}
