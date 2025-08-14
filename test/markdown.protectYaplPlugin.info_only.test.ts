import { describe, expect, it } from "vitest";
import protectYaplPlugin from "../src/markdown/protectYaplPlugin";

describe("protectYaplPlugin wraps fence when info contains 'yapl' even without delimiters", () => {
	it("wraps based on info only", () => {
		const md: any = {
			renderer: {
				rules: {
					fence: (t: any[], i: number) =>
						`<pre><code class="language-${(t[i].info || "").trim()}">${t[i].content}</code></pre>`,
				},
			},
		};
		protectYaplPlugin(md);
		const tokens = [{ info: "yapl", content: "plain" }];
		const html = md.renderer.rules.fence(
			tokens,
			0,
			{},
			{},
			{ renderToken: () => "<pre><code>plain</code></pre>" },
		);
		expect(html).toContain("v-pre");
	});
});
