import { describe, expect, it } from "vitest";
import protectYaplPlugin from "../src/markdown/protectYaplPlugin";

describe("protectYaplPlugin inline no wrap when no delimiters", () => {
	it("does not wrap code_inline without delimiters", () => {
		const md: any = {
			renderer: {
				rules: { code_inline: (_t: any, _i: number) => "<code>plain</code>" },
			},
		};
		protectYaplPlugin(md);
		const html = md.renderer.rules.code_inline(
			[{ content: "plain" }],
			0,
			{},
			{},
			{ renderToken: () => "<code>plain</code>" },
		);
		expect(html).toBe("<code>plain</code>");
	});
});
