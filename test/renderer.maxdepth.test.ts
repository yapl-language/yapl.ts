import { describe, expect, it } from "vitest";
import { NodeYAPL } from "../src/node";

// Use a real file, but constrain maxDepth so that processing nested structures trips the limit.
describe("Renderer max depth", () => {
	it("throws when max depth is exceeded", async () => {
		const yapl = new NodeYAPL({ baseDir: "./test/prompts", maxDepth: 0 });
		await expect(
			yapl.render("tasks/summarize.md.yapl", { domain: "x" }),
		).rejects.toThrow(/Max template depth exceeded/);
	});
});
