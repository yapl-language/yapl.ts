import { describe, expect, it } from "vitest";
import protectYaplPlugin from "../src/markdown/protectYaplPlugin";

describe("protectYaplPlugin fallback renderToken paths", () => {
	function makeMdNoOrig() {
		const md: any = {
			renderer: {
				rules: {
					// No orig rules defined to force self.renderToken path
				},
			},
		};
		protectYaplPlugin(md);
		return md;
	}

	it("uses self.renderToken for fences when origFence is undefined", () => {
		const md = makeMdNoOrig();
		const tokens = [{ info: "yapl", content: "{{ x }}" }];
		const html = md.renderer.rules.fence(
			tokens,
			0,
			{},
			{},
			{
				renderToken: () => "<pre><code>dummy</code></pre>",
			},
		);
		expect(html).toContain("v-pre");
	});

	it("uses self.renderToken for code_block and code_inline when orig is undefined", () => {
		const md = makeMdNoOrig();
		const t1 = [{ content: "{% if x %}{% endif %}" }];
		const t2 = [{ content: "{{ x }}" }];
		const r1 = md.renderer.rules.code_block(
			t1,
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>dummy</code></pre>" },
		);
		const r2 = md.renderer.rules.code_inline(
			t2,
			0,
			{},
			{},
			{ renderToken: () => "<code>dummy</code>" },
		);
		expect(r1).toContain("v-pre");
		expect(r2).toContain("v-pre");
	});
});
