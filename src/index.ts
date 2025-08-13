import * as path from "node:path";
export { default as protectYaplPlugin } from "./markdown/protectYaplPlugin";
export type {
  Vars,
  WhitespaceOptions,
  Prompt,
  RendererOptions,
} from "./renderer";
import { YAPLRenderer } from "./renderer";
import type { WhitespaceOptions, Prompt } from "./renderer";

export interface YAPLOptions {
  baseDir: string;
  cache?: boolean; // unused in browser wrapper
  strictPaths?: boolean; // unused in browser wrapper
  maxDepth?: number;
  whitespace?: WhitespaceOptions;
}

export class YAPL {
  protected baseDir: string;
  protected renderer: YAPLRenderer;

  constructor(opts: YAPLOptions) {
    this.baseDir = path.resolve(opts.baseDir);
    this.renderer = new YAPLRenderer({
      baseDir: this.baseDir,
      maxDepth: opts.maxDepth,
      whitespace: opts.whitespace,
    });
  }

  setBaseDir(dir: string) {
    this.baseDir = path.resolve(dir);
    this.renderer.setBaseDir(this.baseDir);
  }

  async renderString(
    templateSource: string,
    vars: Record<string, unknown> = {},
    currentDir?: string
  ) {
    return await this.renderer.renderString(
      templateSource,
      vars,
      currentDir ? path.resolve(currentDir) : this.baseDir
    );
  }

  async render(
    _templatePath: string,
    _vars: Record<string, unknown> = {}
  ): Promise<Prompt> {
    // Browser wrapper has no file system access
    throw new Error(
      "loadTemplateFile is not available in the browser. Use renderString for browser usage."
    );
  }
}
