/**
 * Markdown-it plugin to protect YAPL-like syntax from Vue template compilation.
 *
 * It wraps code fences, indented code blocks, and inline code that contain
 * YAPL/Jinja-like delimiters ({{ ... }} or {% ... %}), or that are tagged
 * with a language info string including "yapl", in a Vue v-pre container.
 *
 * This prevents Vue (VitePress/VuePress) from trying to parse the contents
 * as JavaScript template expressions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
// biome-ignore lint/suspicious/noExplicitAny: markdown-it types are not available
export function protectYaplPlugin(md: any) {
	const origFence = md.renderer.rules.fence;
	const origCodeBlock = md.renderer.rules.code_block;
	const origCodeInline = md.renderer.rules.code_inline;

	const hasYaplDelimiters = (s: string) => s.includes("{{") || s.includes("{%");
	const looksLikeYapl = (info: string, content: string) =>
		info?.toLowerCase().includes("yapl") || hasYaplDelimiters(content);

	// Fenced code blocks ```
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	md.renderer.rules.fence = (
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		tokens: any[],
		idx: number,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		options: any,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		env: any,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		self: any,
	) => {
		const token = tokens[idx];
		const info = (token.info || "").trim();
		const content = token.content || "";

		const rendered = origFence
			? origFence(tokens, idx, options, env, self)
			: self.renderToken(tokens, idx, options);

		return looksLikeYapl(info, content)
			? `<div v-pre>\n${rendered}\n</div>\n`
			: rendered;
	};

	// Indented code blocks (no language info)
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	md.renderer.rules.code_block = (
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		tokens: any[],
		idx: number,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		options: any,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		env: any,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		self: any,
	) => {
		const token = tokens[idx];
		const content = token.content || "";

		const rendered = origCodeBlock
			? origCodeBlock(tokens, idx, options, env, self)
			: self.renderToken(tokens, idx, options);

		return hasYaplDelimiters(content)
			? `<div v-pre>\n${rendered}\n</div>\n`
			: rendered;
	};

	// Inline code `...`
	// eslint-disable-next-line @typescript-eslint/no-explicit-any
	md.renderer.rules.code_inline = (
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		tokens: any[],
		idx: number,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		options: any,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		env: any,
		// biome-ignore lint/suspicious/noExplicitAny: markdown-it renderer signature
		self: any,
	) => {
		const token = tokens[idx];
		const content = token.content || "";

		const rendered = origCodeInline
			? origCodeInline(tokens, idx, options, env, self)
			: self.renderToken(tokens, idx, options);

		return hasYaplDelimiters(content)
			? `<span v-pre>${rendered}</span>`
			: rendered;
	};
}

export default protectYaplPlugin;
