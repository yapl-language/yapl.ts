import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("applyBlockOverridesToParent no-override path", () => {
	it("keeps parent block content when not overridden", async () => {
		const files: Record<string, string> = {
			"/base/parent.yapl": [
				"{% block a %}PA{% endblock %}",
				"{% block b %}PB{% endblock %}",
			].join("\n"),
		};
		const yapl = new YAPL({
			baseDir: "/base",
			resolvePath: (ref, from, ensure) =>
				ensure(`${from}/${ref}`).replace(/\\+/g, "/"),
			loadFile: async (abs) => files[abs.replace(/\\+/g, "/")],
		});

		const child = '{% extends "parent.yapl" %}{% block a %}CA{% endblock %}';
		const res = await yapl.renderString(child, {}, "/base");
		// Block a overridden, block b comes from parent (exercise else path)
		expect(res.content).toContain("CA");
		expect(res.content).toContain("PB");
	});
});
