import { promises as fs } from "node:fs";
import * as path from "node:path";
import { YAPL, type Vars, type Prompt, type YAPLOptions } from "./index";
import { YAPLRenderer } from "./renderer";

export class NodeYAPL extends YAPL {
  private cacheEnabled: boolean;
  private strictPaths: boolean;
  private fileCache: Map<string, string> = new Map();

  constructor(opts: YAPLOptions) {
    super(opts);
    const baseDir = path.resolve(opts.baseDir);
    this.setBaseDir(baseDir);
    this.cacheEnabled = opts.cache !== false;
    this.strictPaths = opts.strictPaths !== false;

    // Replace base renderer with Node-capable renderer
    const ensureExt = (p: string) => (p.endsWith(".yapl") ? p : `${p}.yapl`);
    this.renderer = new YAPLRenderer({
      baseDir,
      strictPaths: this.strictPaths,
      maxDepth: opts.maxDepth,
      whitespace: opts.whitespace,
      resolvePath: (templateRef, fromDir) => {
        const absolutePath = path.resolve(fromDir, ensureExt(templateRef));
        if (this.strictPaths && !absolutePath.startsWith(baseDir)) {
          throw new Error(`Path escapes baseDir: ${templateRef}`);
        }
        return absolutePath;
      },
      loadFile: async (absolutePath) => {
        if (this.cacheEnabled && this.fileCache.has(absolutePath)) {
          const cachedContent = this.fileCache.get(absolutePath);
          if (cachedContent !== undefined) return cachedContent;
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
    const absolutePath = path.resolve(this.baseDir, ensureExt(templatePath));
    if (this.strictPaths && !absolutePath.startsWith(this.baseDir)) {
      throw new Error(`Path escapes baseDir: ${templatePath}`);
    }
    let fileContent: string;
    if (this.cacheEnabled && this.fileCache.has(absolutePath)) {
      const cached = this.fileCache.get(absolutePath);
      if (cached !== undefined) {
        fileContent = cached;
      } else {
        fileContent = await fs.readFile(absolutePath, "utf8");
        if (this.cacheEnabled) this.fileCache.set(absolutePath, fileContent);
      }
    } else {
      fileContent = await fs.readFile(absolutePath, "utf8");
      if (this.cacheEnabled) this.fileCache.set(absolutePath, fileContent);
    }
    const result = await this.renderer.renderString(
      fileContent,
      vars,
      path.dirname(absolutePath)
    );
    return {
      content: result.content,
      usedFiles: Array.from(new Set([absolutePath, ...result.usedFiles])),
    };
  }
}
