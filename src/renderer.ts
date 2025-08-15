export type Vars = Record<string, unknown>;
import {
	BLOCK_REGEX,
	COMMENT_REGEX,
	EXTENDS_REGEX,
	FOR_REGEX,
	INCLUDE_REGEX,
	MIXIN_REGEX,
	SUPER_REGEX,
	VAR_REGEX,
} from "./constants/regex";
import evaluateCondition from "./utils/evaluateCondition";
import getPath from "./utils/getPath";
import normalizeList from "./utils/normalizeList";
import parseWithObject from "./utils/parseWithObject";

export interface WhitespaceOptions {
	trimBlocks?: boolean;
	lstripBlocks?: boolean;
	dedentBlocks?: boolean;
}

export interface RendererOptions {
	baseDir?: string;
	strictPaths?: boolean;
	maxDepth?: number;
	whitespace?: WhitespaceOptions;
	// Optional hooks to resolve and load templates (for includes/extends/mixins)
	resolvePath?: (
		templateRef: string,
		fromDir: string,
		ensureExt: (p: string) => string,
	) => string;
	loadFile?: (absolutePath: string) => Promise<string>;
	ensureExtension?: (p: string) => string;
}

export interface Prompt {
	content: string;
	usedFiles: string[];
}

interface RenderContext {
	vars: Vars;
	currentDir: string;
	usedFiles: Set<string>;
	depth: number;
}

interface RenderOptionsInternal {
	noExtends?: boolean;
}

// ---------- Whitespace Control Helpers ----------

function dedentText(text: string): string {
	const lines = text
		.replace(/^\n/, "")
		.replace(/\n\s*$/, "")
		.split("\n");
	const nonEmptyLines = lines.filter((line) => line.trim().length > 0);
	if (nonEmptyLines.length === 0) return text;
	const indentLengths = nonEmptyLines.map((line) => {
		const match = line.match(/^[ \t]*/);
		return match ? match[0].length : 0;
	});
	const minIndent = Math.min(...indentLengths);
	return lines.map((line) => line.slice(minIndent)).join("\n");
}

function applyTagTrimming(source: string): string {
	let result = source;
	// Variable tags
	result = result.replace(/[ \t]*\{\{-/g, "{{");
	result = result.replace(/-\}\}[ \t]*\r?\n?/g, "}}");
	// Control tags
	result = result.replace(/[ \t]*\{%-/g, "{%");
	result = result.replace(/-%\}[ \t]*\r?\n?/g, "%}");
	// Comment tags
	result = result.replace(/[ \t]*\{#-/g, "{#");
	result = result.replace(/-#\}[ \t]*\r?\n?/g, "#}");
	return result;
}

function applyGlobalWhitespaceControl(
	source: string,
	options: WhitespaceOptions,
): string {
	let result = source;
	if (options.lstripBlocks) {
		result = result.replace(/^[ \t]+(?=\{%)/gm, "");
	}
	if (options.trimBlocks) {
		result = result.replace(/%\}[ \t]*\r?\n/g, "%}");
	}
	return result;
}

export class YAPLRenderer {
	private baseDir: string;
	private strictPaths: boolean;
	private maxDepth: number;
	private whitespaceOptions: WhitespaceOptions;
	private _resolvePath?: RendererOptions["resolvePath"];
	private _loadFile?: RendererOptions["loadFile"];
	private _ensureExtension: (p: string) => string;

	// Public getters for browser compatibility
	get loadFile() {
		return this._loadFile;
	}
	get resolvePath() {
		return this._resolvePath;
	}
	get ensureExtension() {
		return this._ensureExtension;
	}

	constructor(opts: RendererOptions = {}) {
		this.baseDir = opts.baseDir ? opts.baseDir : "";
		this.strictPaths = opts.strictPaths !== false;
		this.maxDepth = opts.maxDepth ?? 20;
		this.whitespaceOptions = {
			trimBlocks: opts.whitespace?.trimBlocks ?? true,
			lstripBlocks: opts.whitespace?.lstripBlocks ?? true,
			dedentBlocks: opts.whitespace?.dedentBlocks ?? true,
		};
		this._resolvePath = opts.resolvePath;
		this._loadFile = opts.loadFile;
		this._ensureExtension =
			opts.ensureExtension ?? ((p) => (p.endsWith(".yapl") ? p : `${p}.yapl`));
	}

	setBaseDir(dir: string) {
		this.baseDir = dir;
	}

	async renderString(
		templateSource: string,
		vars: Vars = {},
		currentDir?: string,
	): Promise<Prompt> {
		const usedFiles = new Set<string>();
		const renderedContent = await this.processTemplate(templateSource, {
			vars,
			currentDir: currentDir ?? this.baseDir,
			usedFiles,
			depth: 0,
		});
		return { content: renderedContent, usedFiles: Array.from(usedFiles) };
	}

	// ---------- Core Processing ----------

	private async processTemplate(
		templateSource: string,
		context: RenderContext,
		options?: RenderOptionsInternal,
	): Promise<string> {
		if (context.depth > this.maxDepth) {
			throw new Error("Max template depth exceeded (possible recursion).");
		}

		let processedSource = applyTagTrimming(templateSource);
		processedSource = applyGlobalWhitespaceControl(
			processedSource,
			this.whitespaceOptions,
		);
		// Strip comments early so they don't interfere with directive parsing
		processedSource = processedSource.replace(COMMENT_REGEX, "");

		// Handle template inheritance via {% extends %}
		if (!options?.noExtends) {
			const extendsMatch = this.extractDirective(
				processedSource,
				EXTENDS_REGEX,
			);
			if (extendsMatch) {
				return await this.processTemplateInheritance(
					processedSource,
					context,
					extendsMatch[1],
				);
			}
		}

		const cleanedSource = this.stripDirectives(processedSource, [
			EXTENDS_REGEX,
			MIXIN_REGEX,
		]);
		const processedIncludes = await this.processDirectives(
			cleanedSource,
			context,
			INCLUDE_REGEX,
			this.processIncludeDirective.bind(this),
		);
		const processedBlocks = await this.processStandaloneBlocks(
			processedIncludes,
			context,
		);
		const processedIfs = await this.processIfElseStatements(
			processedBlocks,
			context,
		);
		const processedFors = await this.processForLoops(processedIfs, context);
		const cleanedSuper = this.stripDirectives(processedFors, [SUPER_REGEX]);
		return this.processVariableInterpolation(cleanedSuper, context.vars);
	}

	private async processTemplateInheritance(
		childTemplate: string,
		context: RenderContext,
		parentTemplatePath: string,
	): Promise<string> {
		const parentAbsolutePath = this.resolveTemplatePath(
			parentTemplatePath,
			context.currentDir,
		);
		const parentContent = await this.loadTemplateFile(parentAbsolutePath);
		context.usedFiles.add(parentAbsolutePath);

		const parentBlocks = this.extractBlockDefinitions(parentContent);
		const mixinBlocks = await this.collectBlocksFromMixins(
			childTemplate,
			context,
		);
		const childBlocks = this.extractBlockDefinitions(childTemplate);

		const mixinEnhancedBlocks = this.mergeBlocksWithSuper(
			mixinBlocks,
			parentBlocks,
		);
		const finalBlocks = this.mergeBlocksWithSuper(
			childBlocks,
			mixinEnhancedBlocks,
		);

		return await this.applyBlockOverridesToParent(
			parentContent,
			finalBlocks,
			{ ...context, depth: context.depth + 1 },
			context.currentDir,
		);
	}

	// ---------- Directive Processing ----------

	private extractDirective(
		content: string,
		regex: RegExp,
	): RegExpMatchArray | null {
		return content.match(regex);
	}

	private stripDirectives(content: string, regexes: RegExp[]): string {
		return regexes.reduce(
			(result, regex) => result.replace(regex, ""),
			content,
		);
	}

	private async processDirectives<_T>(
		content: string,
		context: RenderContext,
		regex: RegExp,
		processor: (
			match: RegExpMatchArray,
			context: RenderContext,
		) => Promise<string>,
	): Promise<string> {
		return await this.replaceAsync(content, regex, async (...match) => {
			return await processor(match as unknown as RegExpMatchArray, context);
		});
	}

	private async processIncludeDirective(
		match: RegExpMatchArray,
		context: RenderContext,
	): Promise<string> {
		const [, templatePath, withClause] = match;
		const absolutePath = this.resolveTemplatePath(
			templatePath,
			context.currentDir,
		);
		const includeContent = await this.loadTemplateFile(absolutePath);
		context.usedFiles.add(absolutePath);

		const localVars = withClause
			? parseWithObject(withClause, context.vars)
			: {};
		const mergedVars = { ...context.vars, ...localVars };

		return await this.processTemplate(includeContent, {
			vars: mergedVars,
			currentDir: this.dirname(absolutePath),
			usedFiles: context.usedFiles,
			depth: context.depth + 1,
		});
	}

	// ---------- Block Processing ----------

	private async processStandaloneBlocks(
		content: string,
		context: RenderContext,
	): Promise<string> {
		return await this.replaceAsync(
			content,
			BLOCK_REGEX,
			async (_fullMatch, _blockName, blockContent) => {
				const processedContent = this.whitespaceOptions.dedentBlocks
					? dedentText(blockContent)
					: blockContent;
				const renderedContent = await this.processTemplate(
					processedContent,
					{ ...context, depth: context.depth + 1 },
					{ noExtends: true },
				);
				return renderedContent;
			},
		);
	}

	private extractBlockDefinitions(content: string): Record<string, string> {
		const blocks: Record<string, string> = {};
		const blockMatches = Array.from(content.matchAll(BLOCK_REGEX));
		for (const match of blockMatches) {
			const [, blockName, blockContent] = match;
			const processedContent = this.whitespaceOptions.dedentBlocks
				? dedentText(blockContent)
				: blockContent;
			blocks[blockName] = processedContent;
		}
		return blocks;
	}

	private async collectBlocksFromMixins(
		templateContent: string,
		context: RenderContext,
	): Promise<Record<string, string>> {
		const mixinMatches = Array.from(templateContent.matchAll(MIXIN_REGEX));
		const collectedBlocks: Record<string, string> = {};
		if (mixinMatches.length === 0) return collectedBlocks;

		for (const mixinMatch of mixinMatches) {
			const mixinPaths = normalizeList(mixinMatch[1]);
			for (const mixinPath of mixinPaths) {
				const absolutePath = this.resolveTemplatePath(
					mixinPath,
					context.currentDir,
				);
				const mixinContent = await this.loadTemplateFile(absolutePath);
				context.usedFiles.add(absolutePath);
				const mixinBlocks = this.extractBlockDefinitions(mixinContent);
				this.mergeBlocksInto(collectedBlocks, mixinBlocks);
			}
		}
		return collectedBlocks;
	}

	private mergeBlocksInto(
		targetBlocks: Record<string, string>,
		sourceBlocks: Record<string, string>,
	): void {
		for (const [blockName, blockContent] of Object.entries(sourceBlocks)) {
			targetBlocks[blockName] = blockContent;
		}
	}

	private mergeBlocksWithSuper(
		incomingBlocks: Record<string, string>,
		baseBlocks: Record<string, string>,
	): Record<string, string> {
		const mergedBlocks: Record<string, string> = { ...baseBlocks };
		for (const [blockName, blockContent] of Object.entries(incomingBlocks)) {
			const baseContent = baseBlocks[blockName] ?? "";
			mergedBlocks[blockName] = blockContent.replace(SUPER_REGEX, baseContent);
		}
		return mergedBlocks;
	}

	// ---------- If-Else Processing ----------

	private async processIfElseStatements(
		content: string,
		context: RenderContext,
	): Promise<string> {
		return await this.processNestedIfStatements(content, context);
	}

	private async processNestedIfStatements(
		content: string,
		context: RenderContext,
	): Promise<string> {
		let result = content;
		const maxIterations = 50;
		let iteration = 0;
		while (iteration < maxIterations) {
			const newResult = await this.processSingleIfStatement(result, context);
			if (newResult === result) break;
			result = newResult;
			iteration++;
		}
		return result;
	}

	private async processSingleIfStatement(
		content: string,
		context: RenderContext,
	): Promise<string> {
		const ifMatch = content.match(/\{%-?\s*if\s+([^%]+?)\s*-?%\}/);
		if (!ifMatch) return content;
		const ifStart = content.indexOf(ifMatch[0]);
		const condition = ifMatch[1];
		const { endifIndex, ifContent, elseContent } = this.findMatchingEndif(
			content,
			ifStart,
		);
		if (endifIndex === -1) return content;
		const conditionResult = evaluateCondition(condition, context.vars);
		let replacement: string;
		if (conditionResult) {
			const processedContent = this.whitespaceOptions.dedentBlocks
				? dedentText(ifContent)
				: ifContent;
			replacement = await this.processTemplate(
				processedContent,
				{ ...context, depth: context.depth + 1 },
				{ noExtends: true },
			);
		} else if (elseContent !== null) {
			const processedContent = this.whitespaceOptions.dedentBlocks
				? dedentText(elseContent)
				: elseContent;
			replacement = await this.processTemplate(
				processedContent,
				{ ...context, depth: context.depth + 1 },
				{ noExtends: true },
			);
		} else {
			replacement = "";
		}
		const endifEnd = content.indexOf("%}", endifIndex) + 2;
		const fullIfStatement = content.slice(ifStart, endifEnd);
		return content.replace(fullIfStatement, replacement);
	}

	private findMatchingEndif(
		content: string,
		ifStart: number,
	): {
		endifIndex: number;
		elseIndex: number | null;
		ifContent: string;
		elseContent: string | null;
	} {
		let depth = 0;
		let elseIndex: number | null = null;
		let elseTagLength = 0;
		let pos = content.indexOf("%}", ifStart) + 2;
		while (pos < content.length) {
			const nextTagMatch = content.slice(pos).match(/\{%-?\s*(if|else|endif)/);
			if (!nextTagMatch) break;
			const tagStart = pos + (nextTagMatch.index ?? 0);
			const tagType = nextTagMatch[1];
			if (tagType === "if") {
				depth++;
				pos = content.indexOf("%}", tagStart) + 2;
			} else if (tagType === "else" && depth === 0 && elseIndex === null) {
				elseIndex = tagStart;
				const tagEnd = content.indexOf("%}", tagStart) + 2;
				elseTagLength = tagEnd - tagStart;
				pos = tagEnd;
			} else if (tagType === "endif") {
				if (depth === 0) {
					const ifTagEnd = content.indexOf("%}", ifStart) + 2;
					const ifContent = content.slice(ifTagEnd, elseIndex || tagStart);
					const elseContent = elseIndex
						? content.slice(elseIndex + elseTagLength, tagStart)
						: null;
					return { endifIndex: tagStart, elseIndex, ifContent, elseContent };
				}
				depth--;
				pos = content.indexOf("%}", tagStart) + 2;
			} else {
				pos = content.indexOf("%}", tagStart) + 2;
			}
		}
		return {
			endifIndex: -1,
			elseIndex: null,
			ifContent: "",
			elseContent: null,
		};
	}

	// ---------- For Loop Processing ----------

	private async processForLoops(
		content: string,
		context: RenderContext,
	): Promise<string> {
		return await this.processNestedForLoops(content, context);
	}

	private async processNestedForLoops(
		content: string,
		context: RenderContext,
	): Promise<string> {
		let result = content;
		const maxIterations = 50;
		let iteration = 0;
		while (iteration < maxIterations) {
			const newResult = await this.processSingleForLoop(result, context);
			if (newResult === result) break;
			result = newResult;
			iteration++;
		}
		return result;
	}

	private async processSingleForLoop(
		content: string,
		context: RenderContext,
	): Promise<string> {
		const forMatch = content.match(
			/\{%-?\s*for\s+([a-zA-Z0-9_]+)\s+in\s+([^%]+?)\s*-?%\}/,
		);
		if (!forMatch) return content;

		const forStart = content.indexOf(forMatch[0]);
		const iteratorVar = forMatch[1];
		const iterableExpr = forMatch[2].trim();

		const { endforIndex, forContent } = this.findMatchingEndfor(
			content,
			forStart,
		);
		if (endforIndex === -1) return content;

		// Evaluate the iterable expression
		const iterableValue = this.evaluateIterableExpression(
			iterableExpr,
			context.vars,
		);

		// Process the loop content for each item
		let replacement = "";
		for (const item of iterableValue) {
			const loopContext = {
				...context,
				vars: {
					...context.vars,
					[iteratorVar]: item,
				},
				depth: context.depth + 1,
			};

			const processedContent = this.whitespaceOptions.dedentBlocks
				? dedentText(forContent)
				: forContent;

			const renderedContent = await this.processTemplate(
				processedContent,
				loopContext,
				{ noExtends: true },
			);
			replacement += renderedContent;
		}

		const endforEnd = content.indexOf("%}", endforIndex) + 2;
		const fullForStatement = content.slice(forStart, endforEnd);
		return content.replace(fullForStatement, replacement);
	}

	private findMatchingEndfor(
		content: string,
		forStart: number,
	): {
		endforIndex: number;
		forContent: string;
	} {
		let depth = 0;
		let pos = content.indexOf("%}", forStart) + 2;

		while (pos < content.length) {
			const nextTagMatch = content.slice(pos).match(/\{%-?\s*(for|endfor)/);
			if (!nextTagMatch) break;

			const tagStart = pos + (nextTagMatch.index ?? 0);
			const tagType = nextTagMatch[1];

			if (tagType === "for") {
				depth++;
				pos = content.indexOf("%}", tagStart) + 2;
			} else if (tagType === "endfor") {
				if (depth === 0) {
					const forTagEnd = content.indexOf("%}", forStart) + 2;
					const forContent = content.slice(forTagEnd, tagStart);
					return { endforIndex: tagStart, forContent };
				}
				depth--;
				pos = content.indexOf("%}", tagStart) + 2;
			}
		}

		return {
			endforIndex: -1,
			forContent: "",
		};
	}

	private evaluateIterableExpression(expr: string, vars: Vars): unknown[] {
		// Handle direct variable references
		if (/^[a-zA-Z0-9_.]+$/.test(expr)) {
			const value = getPath(vars, expr);
			if (value === undefined || value === null) {
				return [];
			}
			if (!Array.isArray(value)) {
				throw new Error(
					`For loop iterable must be an array, got: ${typeof value}`,
				);
			}
			return value;
		}

		// Handle array literals like [1, 2, 3] or ["a", "b", "c"]
		if (expr.startsWith("[") && expr.endsWith("]")) {
			try {
				const parsed = JSON.parse(expr);
				if (!Array.isArray(parsed)) {
					throw new Error(
						`For loop iterable must be an array, got: ${typeof parsed}`,
					);
				}
				return parsed;
			} catch (e) {
				if (
					e instanceof Error &&
					e.message.includes("For loop iterable must be an array")
				) {
					throw e;
				}
				// If JSON parsing fails, try to parse as a simple list
				const items = expr
					.slice(1, -1)
					.split(",")
					.map((item) => {
						const trimmed = item.trim();
						// Remove quotes if present
						if (
							(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
							(trimmed.startsWith("'") && trimmed.endsWith("'"))
						) {
							return trimmed.slice(1, -1);
						}
						// Try to parse as number
						const num = Number(trimmed);
						return Number.isNaN(num) ? trimmed : num;
					});
				return items;
			}
		}

		// For more complex expressions, try to evaluate them as variables
		const value = getPath(vars, expr);
		if (value === undefined || value === null) {
			return [];
		}
		if (!Array.isArray(value)) {
			throw new Error(
				`For loop iterable must be an array, got: ${typeof value}`,
			);
		}
		return value;
	}

	// ---------- Variable Processing ----------

	private processVariableInterpolation(
		templateContent: string,
		vars: Vars,
	): string {
		return templateContent.replace(
			VAR_REGEX,
			(_, variablePath, defaultValue1, defaultValue2) => {
				const variableValue = getPath(vars, variablePath);
				const defaultValue = defaultValue1 ?? defaultValue2;
				if (variableValue === undefined || variableValue === null) {
					return defaultValue ?? "";
				}
				return String(variableValue);
			},
		);
	}

	private async applyBlockOverridesToParent(
		parentContent: string,
		blockOverrides: Record<string, string>,
		context: RenderContext,
		childDir: string,
	): Promise<string> {
		let processedContent = parentContent;
		const parentBlockMatches = Array.from(parentContent.matchAll(BLOCK_REGEX));
		const processedBlockNames = new Set<string>();
		for (const blockMatch of parentBlockMatches) {
			const [fullMatch, blockName, parentBlockContent] =
				blockMatch as unknown as [string, string, string];
			processedBlockNames.add(blockName);
			const renderedParentContent = await this.processTemplate(
				parentBlockContent,
				{ ...context, depth: context.depth + 1 },
				{ noExtends: true },
			);
			let blockReplacement: string;
			if (blockOverrides[blockName] !== undefined) {
				const overrideWithSuper = blockOverrides[blockName].replace(
					SUPER_REGEX,
					renderedParentContent,
				);
				blockReplacement = await this.processTemplate(
					overrideWithSuper,
					{
						vars: context.vars,
						currentDir: childDir,
						usedFiles: context.usedFiles,
						depth: context.depth + 1,
					},
					{ noExtends: true },
				);
			} else {
				blockReplacement = renderedParentContent;
			}
			processedContent = processedContent.replace(fullMatch, blockReplacement);
		}

		processedContent = await this.processTemplate(processedContent, context, {
			noExtends: true,
		});

		const childOnlyBlocks: string[] = [];
		for (const [blockName, blockContent] of Object.entries(blockOverrides)) {
			if (!processedBlockNames.has(blockName)) {
				const renderedChildBlock = await this.processTemplate(
					blockContent,
					{
						vars: context.vars,
						currentDir: childDir,
						usedFiles: context.usedFiles,
						depth: context.depth + 1,
					},
					{ noExtends: true },
				);
				childOnlyBlocks.push(renderedChildBlock);
			}
		}
		if (childOnlyBlocks.length > 0) {
			processedContent += `\n${childOnlyBlocks.join("\n")}`;
		}
		return processedContent;
	}

	// ---------- Loader/Resolver helpers ----------

	private resolveTemplatePath(templateRef: string, fromDir: string): string {
		if (!this._resolvePath) {
			throw new Error(
				"No resolvePath provided. File-based operations are not available in this environment.",
			);
		}
		return this._resolvePath(
			this._ensureExtension(templateRef),
			fromDir,
			this._ensureExtension,
		);
	}

	private async loadTemplateFile(absolutePath: string): Promise<string> {
		if (!this._loadFile) {
			throw new Error(
				"No loadFile provided. File-based operations are not available in this environment.",
			);
		}
		return await this._loadFile(absolutePath);
	}

	private dirname(p: string): string {
		const idx = p.replace(/\\/g, "/").lastIndexOf("/");
		return idx >= 0 ? p.slice(0, idx) : "";
	}

	private async replaceAsync(
		content: string,
		regex: RegExp,
		replacer: (...match: string[]) => Promise<string>,
	): Promise<string> {
		const replacementPromises: Promise<string | string[]>[] = [];
		let lastIndex = 0;
		const matches = Array.from(content.matchAll(regex));
		for (const match of matches) {
			const matchIndex = match.index ?? 0;
			replacementPromises.push(
				Promise.resolve(content.slice(lastIndex, matchIndex)),
			);
			replacementPromises.push(replacer(...(match as unknown as string[])));
			lastIndex = matchIndex + match[0].length;
		}
		replacementPromises.push(Promise.resolve(content.slice(lastIndex)));
		const resolvedParts = await Promise.all(replacementPromises);
		return resolvedParts.join("");
	}
}
