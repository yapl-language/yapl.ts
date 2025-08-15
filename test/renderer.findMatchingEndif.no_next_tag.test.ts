import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("findMatchingEndif path where no subsequent tag is found (break)", () => {
	it("leaves content unchanged when no next tag is found during scan", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		// After {% if cond %}, provide content that has neither else nor endif; scanner breaks on no next tag
		const tpl = "X{% if cond %} Y";
		const res = await yapl.renderString(tpl, { cond: true });
		// processSingleIfStatement sees endifIndex === -1 and returns original content
		expect(res.content).toBe(tpl);
	});
});
