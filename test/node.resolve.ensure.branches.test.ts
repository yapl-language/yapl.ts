import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { NodeYAPL } from "../src/node";

// Cover constructor resolver ensureExtension path and strictPaths on resolution

describe("NodeYAPL resolve/ensure/strict branches", () => {
	it("ensures extension and resolves within baseDir", async () => {
		const baseDir = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({ baseDir, strictPaths: true });
		const res = await yapl.render("tasks/test-no-extension.md", {
			domain: "x",
		});
		expect(res.content).toContain("# System");
	});
});
