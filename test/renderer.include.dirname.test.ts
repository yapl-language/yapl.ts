import { describe, expect, it } from "vitest";
import { NodeYAPL } from "../src/node";

describe("Renderer include + dirname coverage", () => {
	it("processes include and uses dirname of included file", async () => {
		const yapl = new NodeYAPL({ baseDir: "./test/prompts" });
		const tpl = '{% include "tasks/summarize.md.yapl" %}';
		const res = await yapl.renderString(
			tpl,
			{ domain: "inc" },
			"./test/prompts",
		);
		expect(res.content).toContain("Summarize the following text");
	});
});
