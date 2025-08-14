import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { NodeYAPL } from "../src/node";

// This test simulates the unlikely case where Map.has returns true but get returns undefined
// by intercepting the fileCache map.

describe("NodeYAPL cache edge cases", () => {
	it("falls back to reading file when cached value is undefined", async () => {
		const baseDir = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({ baseDir, cache: true });
		// @ts-expect-error hijack private field for test coverage
		const original = yapl.fileCache;
		// @ts-expect-error hijack private field for test coverage
		yapl.fileCache = {
			has: (k: string) => k.endsWith("tasks/summarize.md.yapl"),
			get: (_: string) => undefined,
			set: vi.fn(),
		} as any;

		const res = await yapl.render("tasks/summarize.md.yapl", { domain: "x" });
		expect(res.content).toContain("Summarize the following text");
		// @ts-expect-error restore
		yapl.fileCache = original;
	});
});
