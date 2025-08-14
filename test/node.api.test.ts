import { promises as fs } from "node:fs";
import * as path from "node:path";
import { describe, expect, it, vi } from "vitest";
import { NodeYAPL } from "../src/node";

describe("NodeYAPL API", () => {
	it("resolves and loads files, caches when enabled", async () => {
		const baseDir = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({ baseDir, cache: true });
		const spy = vi.spyOn(fs, "readFile");
		await yapl.render("tasks/summarize.md.yapl", { domain: "x" });
		const calls1 = spy.mock.calls.length;
		await yapl.render("tasks/summarize.md.yapl", { domain: "x" });
		const calls2 = spy.mock.calls.length;
		expect(calls2).toBe(calls1);
		spy.mockRestore();
	});

	it("throws on path escaping baseDir when strictPaths is true", async () => {
		const baseDir = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({ baseDir, strictPaths: true });
		await expect(yapl.render("../outside.md.yapl")).rejects.toThrow();
	});
});
