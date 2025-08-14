import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("Renderer whitespace options off", () => {
	it("does not lstrip or trim blocks when disabled", async () => {
		const yapl = new YAPL({
			baseDir: "/",
			whitespace: {
				lstripBlocks: false,
				trimBlocks: false,
				dedentBlocks: false,
			},
		});
		const tpl = "  {% block a %}\nline\n{% endblock %}\n";
		const res = await yapl.renderString(tpl);
		// With options disabled, the leading two spaces before the block remain, and the newline after %} remains
		expect(res.content.startsWith("  ")).toBe(true);
		expect(res.content.endsWith("\n")).toBe(true);
	});

	it("returns empty string when variable missing and no default is provided", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "X{{ missing }}Y";
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("XY");
	});
});
