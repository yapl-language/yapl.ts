import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("YAPLRenderer constructor with all whitespace options false", () => {
	it("respects explicit false values (no trimming/dedent)", async () => {
		const yapl = new YAPL({
			baseDir: "/",
			whitespace: {
				trimBlocks: false,
				lstripBlocks: false,
				dedentBlocks: false,
			},
		});
		const tpl = "  {%- block a -%}\n    L1\n  {%- endblock -%}\n";
		const res = await yapl.renderString(tpl);
		// With all disabled, leading spaces before tag remain, and block content keeps its indentation
		expect(res.content).toContain("  ");
		expect(res.content).toContain("    L1\n");
	});
});
