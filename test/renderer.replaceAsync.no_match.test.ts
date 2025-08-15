import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

// Covers replaceAsync path where there are no matches for the regex
// ensuring the last slice-only join path is exercised.
describe("replaceAsync when regex does not match", () => {
	it("returns original content when INCLUDE regex does not match", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		// No directives present, includes won't match
		const tpl = "No directives here";
		const res = await yapl.renderString(tpl, {});
		expect(res.content).toBe(tpl);
	});
});
