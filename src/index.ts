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
	baseDir: string;
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

	constructor(opts: YAPLOptions) {
		this.baseDir = resolvePath(opts.baseDir);
		this.renderer = new YAPLRenderer({
			baseDir: this.baseDir,
			maxDepth: opts.maxDepth,
			whitespace: opts.whitespace,
			resolvePath: opts.resolvePath,
			loadFile: opts.loadFile,
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
