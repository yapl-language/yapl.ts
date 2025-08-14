import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("YAPL.render without resolvePath (else branch)", () => {
	it("uses templatePath directly when resolvePath is missing", async () => {
		const files: Record<string, string> = {
			"/abs/template.yapl": "OK",
		};
		const yapl = new YAPL({
			baseDir: "/abs",
			loadFile: async (abs) => files[abs],
			// no resolvePath provided on purpose
		});
		const res = await yapl.render("/abs/template.yapl");
		expect(res.content).toBe("OK");
	});
});
