import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("Renderer include with with-clause merges vars", () => {
	it("passes local vars parsed from object literal", async () => {
		const files: Record<string, string> = {
			"/base/inc.yapl": "{{ a }}-{{ b }}-{{ c }}",
		};
		const yapl = new YAPL({
			baseDir: "/base",
			resolvePath: (ref, from, ensure) =>
				ensure(`${from}/${ref}`).replace(/\\+/g, "/"),
			loadFile: async (abs) => files[abs.replace(/\\+/g, "/")],
		});
		const tpl = '{% include "inc" with { "a": "X", "b": parent, "c": 2 } %}';
		const res = await yapl.renderString(tpl, { parent: "Y" });
		expect(res.content).toBe("X-Y-2");
	});
});
