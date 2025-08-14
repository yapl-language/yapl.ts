import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("applyBlockOverridesToParent appends multiple child-only blocks", () => {
	it("appends extra blocks at end of parent", async () => {
		const files: Record<string, string> = {
			"/b/p.yapl": "{% block a %}PA{% endblock %}",
		};
		const yapl = new YAPL({
			baseDir: "/b",
			resolvePath: (ref, from, ensure) =>
				ensure(`${from}/${ref}`).replace(/\\+/g, "/"),
			loadFile: async (abs) => files[abs.replace(/\\+/g, "/")],
		});
		const child =
			'{% extends "p" %}{% block x %}X{% endblock %}{% block y %}Y{% endblock %}';
		const res = await yapl.renderString(child, {}, "/b");
		expect(res.content.trim().endsWith("X\nY")).toBe(true);
	});
});
