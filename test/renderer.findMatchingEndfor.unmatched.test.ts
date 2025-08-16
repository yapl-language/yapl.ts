import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("renderer.findMatchingEndfor - unmatched for (no endfor)", () => {
	it("leaves content unchanged when a for tag has no matching endfor", async () => {
		const tpl = "Before {% for x in items %}X After";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, { items: [1, 2, 3] });
		// Since there is no matching endfor, processSingleForLoop should return original content
		expect(res.content).toBe(tpl);
	});
});
