import { describe, expect, it } from "vitest";
import { NodeYAPL } from "../src/node";

describe("Renderer childOnlyBlocks appended to parent output", () => {
	it("appends child-only blocks at the end", async () => {
		const yapl = new NodeYAPL({ baseDir: "./test/prompts" });
		const tpl =
			'{% extends "./base/system.md.yapl" %}{% block extra %}EXTRA_CONTENT{% endblock %}';
		const res = await yapl.renderString(tpl, {}, "./test/prompts");
		expect(res.content).toContain("EXTRA_CONTENT");
		// Should be appended (not replacing any existing block), so we still have System content
		expect(res.content).toContain("# System");
	});
});
