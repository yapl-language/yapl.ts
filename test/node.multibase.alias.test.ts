import { describe, expect, it, vi } from "vitest";
import * as path from "node:path";
import { NodeYAPL } from "../src/node";

// Helper to create two base dirs: local project prompts and an overrides folder
// We'll reuse existing test/prompts for base1 and create a temp overrides dir for base2

describe("NodeYAPL multi baseDirs and @awesome-yapl alias", () => {
	it("resolves includes across multiple baseDirs with last winning precedence", async () => {
		const base1 = path.resolve("./test/prompts");
		const base2 = path.resolve("./test/prompts_override");
		// Create an override file with same relative path as an existing one
		const fs = await import("node:fs/promises");
		await fs.mkdir(path.join(base2, "tasks"), { recursive: true });
		await fs.writeFile(
			path.join(base2, "tasks/summarize.md.yapl"),
			"Override: summarize {{ domain }}",
		);

		const yapl = new NodeYAPL({ baseDir: [base1, base2], cache: false });
		const res = await yapl.render("tasks/summarize.md.yapl", { domain: "X" });
		expect(res.content).toContain("Override: summarize X");
	});

	it("supports alias @awesome-yapl and fetches remote content via include", async () => {
		// Mock global fetch
		const mock = vi.fn(async (url: string) => {
			// Expect URL ends with /agent/base.md.yapl
			expect(url).toMatch(/awesome-yapl\/main\/prompts\/agent\/base.md.yapl$/);
			return {
				ok: true,
				text: async () => "Hello from remote {{ name }}",
				status: 200,
			} as unknown as Response;
		});
		// @ts-expect-error assign global fetch for test
		global.fetch = mock;

		const baseLocal = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({
			baseDir: [baseLocal, "@awesome-yapl"],
			cache: true,
		});
		const res = await yapl.render("@awesome-yapl/agent/base.md.yapl", {
			name: "Neo",
		});
		expect(res.content).toBe("Hello from remote Neo");
		// Ensure caching works too (fetch not called again for renderString inner loads)
		const res2 = await yapl.render("@awesome-yapl/agent/base.md.yapl", {
			name: "Trinity",
		});
		expect(res2.content).toBe("Hello from remote Trinity");
		expect(mock).toHaveBeenCalledTimes(1);
	});
});
