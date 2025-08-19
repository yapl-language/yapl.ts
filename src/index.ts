// Browser-compatible path utilities
function resolvePath(basePath: string): string {
	// Simple browser path resolution - just normalize slashes
	return basePath.replace(/\\/g, "/").replace(/\/+/g, "/");
}

function dirname(filePath: string): string {
	const parts = filePath.split("/");
	parts.pop(); // Remove the filename
	return parts.join("/") || "/";
}

export { default as protectYaplPlugin } from "./markdown/protectYaplPlugin";
export type {
	Vars,
	WhitespaceOptions,
	Prompt,
	RendererOptions,
} from "./renderer";
import { YAPLRenderer } from "./renderer";
import type { Prompt, WhitespaceOptions } from "./renderer";

export interface YAPLOptions {
	/** Base directory (or directories) for templates */
	baseDir: string | string[];
	cache?: boolean; // unused in browser wrapper
	strictPaths?: boolean; // unused in browser wrapper
	maxDepth?: number;
	whitespace?: WhitespaceOptions;
	// Browser-specific options
	resolvePath?: (
		templateRef: string,
		fromDir: string,
		ensureExt: (p: string) => string,
	) => string;
	loadFile?: (absolutePath: string) => Promise<string>;
	ensureExtension?: (p: string) => string;
}

export class YAPL {
	protected baseDir: string;
	protected renderer: YAPLRenderer;
	protected baseDirs: string[] = [];
	protected remoteAliases: Record<string, string> = {};

	constructor(opts: YAPLOptions) {
		const inputBases = Array.isArray(opts.baseDir)
			? opts.baseDir
			: [opts.baseDir];
		// Normalize to forward-slash paths/URLs
		this.baseDirs = inputBases.map((b) => resolvePath(b));
		// Backwards-compat primary baseDir remains the first entry
		const initialBase = this.baseDirs[0] ?? "";
		this.baseDir = resolvePath(initialBase);

		// Known alias for remote prompts repo
		if (this.baseDirs.includes("@awesome-yapl")) {
			this.remoteAliases["@awesome-yapl"] =
				"https://raw.githubusercontent.com/yapl-language/awesome-yapl/main/prompts";
		}

		// In browser: if user provides hooks, use them.
		// Otherwise, provide defaults only when dealing with URL/alias usage.
		const hasRemoteBases = this.baseDirs.some(
			(b) =>
				b.startsWith("http://") ||
				b.startsWith("https://") ||
				b === "@awesome-yapl",
		);

		const defaultResolvePath = (
			templateRef: string,
			fromDir: string,
			ensureExt: (p: string) => string,
		): string => {
			const ref = ensureExt(templateRef);
			// Alias mapping
			for (const [alias, baseUrl] of Object.entries(this.remoteAliases)) {
				if (ref.startsWith(`${alias}/`)) {
					const rest = ref.slice(alias.length + 1);
					return `${baseUrl}/${rest}`;
				}
			}
			// Absolute URL passthrough
			if (/^https?:\/\//.test(ref)) return ref;
			// Relative path (./ or ../): resolve against fromDir
			if (ref.startsWith("./") || ref.startsWith("../")) {
				return resolvePath(`${fromDir}/${ref}`);
			}
			// Root-relative: prefer the last baseDir
			for (let i = this.baseDirs.length - 1; i >= 0; i--) {
				const baseI = this.baseDirs[i];
				if (!baseI) continue;
				if (baseI === "@awesome-yapl") {
					const baseUrl = this.remoteAliases["@awesome-yapl"];
					return `${baseUrl}/${ref}`;
				}
				// Treat base as URL-like prefix
				if (baseI.startsWith("http://") || baseI.startsWith("https://")) {
					return resolvePath(`${baseI}/${ref}`);
				}
				// Fallback: resolve from initial baseDir
			}
			return resolvePath(`${fromDir}/${ref}`);
		};

		const defaultLoadFile = async (absolutePath: string): Promise<string> => {
			const res = await fetch(absolutePath);
			if (!res.ok) {
				throw new Error(`Failed to fetch ${absolutePath}: ${res.status}`);
			}
			return await res.text();
		};

		this.renderer = new YAPLRenderer({
			baseDir: this.baseDir,
			maxDepth: opts.maxDepth,
			whitespace: opts.whitespace,
			// Only provide defaults if the user didn't and we have remote-style bases
			resolvePath:
				opts.resolvePath ?? (hasRemoteBases ? defaultResolvePath : undefined),
			loadFile: opts.loadFile ?? (hasRemoteBases ? defaultLoadFile : undefined),
			ensureExtension: opts.ensureExtension,
		});
	}

	setBaseDir(dir: string) {
		this.baseDir = resolvePath(dir);
		this.renderer.setBaseDir(this.baseDir);
	}

	private dirname(filePath: string): string {
		return dirname(filePath);
	}

	async renderString(
		templateSource: string,
		vars: Record<string, unknown> = {},
		currentDir?: string,
	) {
		return await this.renderer.renderString(
			templateSource,
			vars,
			currentDir ? resolvePath(currentDir) : this.baseDir,
		);
	}

	async render(
		templatePath: string,
		vars: Record<string, unknown> = {},
	): Promise<Prompt> {
		// Use the renderer's template loading if loadFile is provided
		if (!this.renderer.loadFile) {
			throw new Error(
				"File loading is not available. Provide a loadFile function in YAPLOptions or use renderString for browser usage.",
			);
		}

		// Load the template file and render it
		const absolutePath = this.renderer.resolvePath
			? this.renderer.resolvePath(
					templatePath,
					this.baseDir,
					this.renderer.ensureExtension,
				)
			: templatePath;

		const templateContent = await this.renderer.loadFile(absolutePath);
		// Use the directory of the template file as the current directory
		const templateDir = this.dirname(absolutePath);
		return await this.renderString(templateContent, vars, templateDir);
	}
}
