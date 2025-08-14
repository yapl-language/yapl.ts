import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

// Cover trailing-iteration fallback in findMatchingEndif by having an opening if with no matching endif

describe("findMatchingEndif edge fallbacks", () => {
	it("leaves content unchanged if endif not found", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "{% if x %}Unclosed"; // no endif
		const res = await yapl.renderString(tpl, { x: true });
		// Since not parsed, the tag remains
		expect(res.content).toContain("{% if x %}Unclosed");
	});
});
