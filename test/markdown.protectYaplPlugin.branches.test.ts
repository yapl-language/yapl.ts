import { describe, expect, it } from "vitest";
import protectYaplPlugin from "../src/markdown/protectYaplPlugin";

describe("protectYaplPlugin branch paths", () => {
	function mdWithRules(overrides: Partial<Record<string, any>> = {}) {
		const baseRules: any = {
			fence(tokens: any[], idx: number) {
				return `<pre><code class="language-${(tokens[idx].info || "").trim()}">${tokens[idx].content}</code></pre>`;
			},
			code_block(tokens: any[], idx: number) {
				return `<pre><code>${tokens[idx].content}</code></pre>`;
			},
			code_inline(tokens: any[], idx: number) {
				return `<code>${tokens[idx].content}</code>`;
			},
		};
		const rules = { ...baseRules, ...overrides };
		const md: any = { renderer: { rules } };
		protectYaplPlugin(md);
		return md;
	}

	it("respects info without yapl when content has delimiters", () => {
		const md = mdWithRules();
		const tokens = [{ info: "txt", content: "Hello {{ x }}" }];
		const html = md.renderer.rules.fence(
			tokens,
			0,
			{},
			{},
			{ renderToken: () => "" },
		);
		expect(html).toContain("v-pre");
	});

	it("does not wrap when info lacks yapl and content lacks delimiters", () => {
		const md = mdWithRules();
		const tokens = [{ info: "txt", content: "plain" }];
		const html = md.renderer.rules.fence(
			tokens,
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>plain</code></pre>" },
		);
		expect(html).not.toContain("v-pre");
	});

	it("wraps code_block and code_inline when content has {# comments #}", () => {
		const md = mdWithRules();
		const b = md.renderer.rules.code_block(
			[{ content: "{# a #}" }],
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>{# a #}</code></pre>" },
		);
		const i = md.renderer.rules.code_inline(
			[{ content: "{# a #}" }],
			0,
			{},
			{},
			{ renderToken: () => "<code>{# a #}</code>" },
		);
		expect(b).toContain("v-pre");
		expect(i).toContain("v-pre");
	});
});
