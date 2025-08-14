import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("Renderer error branches", () => {
	it("throws when include used without resolvePath (browser wrapper)", async () => {
		const yapl = new YAPL({ baseDir: "./test/prompts" });
		const tpl = '{% include "tasks/summarize.md.yapl" %}';
		await expect(yapl.renderString(tpl, {}, "./test/prompts")).rejects.toThrow(
			/No resolvePath provided/,
		);
	});

	it("throws when include has resolvePath but missing loadFile", async () => {
		const yapl = new YAPL({
			baseDir: "./test/prompts",
			resolvePath: (ref, from, ensure) => ensure(`${from}/${ref}`),
			// intentionally omit loadFile
		});
		const tpl = '{% include "tasks/summarize.md.yapl" %}';
		await expect(yapl.renderString(tpl, {}, "./test/prompts")).rejects.toThrow(
			/No loadFile provided/,
		);
	});
});
