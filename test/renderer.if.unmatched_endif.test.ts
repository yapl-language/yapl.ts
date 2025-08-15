import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("Renderer if with no matching endif returns input unchanged", () => {
	it("leaves content as-is when endif is missing", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "Before {% if cond %} dangling"; // missing {% endif %}
		const res = await yapl.renderString(tpl, { cond: true });
		// With unmatched endif, processSingleIfStatement returns content unchanged, so result should equal input
		expect(res.content).toBe(tpl);
	});
});
