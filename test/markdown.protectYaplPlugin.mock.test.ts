import { describe, expect, it } from "vitest";
import protectYaplPlugin from "../src/markdown/protectYaplPlugin";

describe("protectYaplPlugin without markdown-it dep", () => {
	function makeMd() {
		const calls: any[] = [];
		const md: any = {
			renderer: {
				rules: {
					fence(tokens: any[], idx: number) {
						calls.push({
							type: "fence",
							content: tokens[idx].content,
							info: tokens[idx].info,
						});
						return `<pre><code class="language-${(tokens[idx].info || "").trim()}">${tokens[idx].content}</code></pre>`;
					},
					code_block(tokens: any[], idx: number) {
						calls.push({ type: "code_block", content: tokens[idx].content });
						return `<pre><code>${tokens[idx].content}</code></pre>`;
					},
					code_inline(tokens: any[], idx: number) {
						calls.push({ type: "code_inline", content: tokens[idx].content });
						return `<code>${tokens[idx].content}</code>`;
					},
				},
			},
		};
		protectYaplPlugin(md);
		return { md, calls };
	}

	it("wraps fenced blocks that look like YAPL (by info or content)", () => {
		const { md } = makeMd();
		const yaplTokens = [{ info: "yapl", content: "Hello {{ name }}" }];
		const otherTokens = [{ info: "txt", content: "no delimiters" }];
		const html1 = md.renderer.rules.fence(
			yaplTokens,
			0,
			{},
			{},
			{ renderToken: () => "" },
		);
		const html2 = md.renderer.rules.fence(
			otherTokens,
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>no delimiters</code></pre>" },
		);
		expect(html1).toContain("v-pre");
		expect(html2).not.toContain("v-pre");
	});

	it("wraps indented code blocks with YAPL delimiters", () => {
		const { md } = makeMd();
		const tokens = [{ content: "A {% if x %}B{% endif %}" }];
		const html = md.renderer.rules.code_block(
			tokens,
			0,
			{},
			{},
			{ renderToken: () => "" },
		);
		expect(html).toContain("v-pre");
	});

	it("wraps inline code with YAPL delimiters", () => {
		const { md } = makeMd();
		const tokens = [{ content: "{{ x }}" }];
		const html = md.renderer.rules.code_inline(
			tokens,
			0,
			{},
			{},
			{ renderToken: () => "" },
		);
		expect(html).toContain("v-pre");
	});

	it("does not wrap when no delimiters are present", () => {
		const { md } = makeMd();
		const tokens1 = [{ info: "txt", content: "plain" }];
		const tokens2 = [{ content: "plain" }];
		const html1 = md.renderer.rules.fence(
			tokens1,
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>plain</code></pre>" },
		);
		const html2 = md.renderer.rules.code_block(
			tokens2,
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>plain</code></pre>" },
		);
		const html3 = md.renderer.rules.code_inline(
			tokens2,
			0,
			{},
			{},
			{ renderToken: () => "<code>plain</code>" },
		);
		expect(html1).not.toContain("v-pre");
		expect(html2).not.toContain("v-pre");
		expect(html3).not.toContain("v-pre");
	});
});
