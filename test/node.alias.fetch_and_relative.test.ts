import { describe, expect, it, vi } from "vitest";
import { NodeYAPL } from "../src/node";
import * as path from "node:path";

describe("NodeYAPL URL and relative path branches", () => {
	it("includes from absolute URL via fetch", async () => {
		const mock = vi.fn(async (url: string) => {
			expect(url).toBe("https://example.com/x.md.yapl");
			return {
				ok: true,
				status: 200,
				text: async () => "ABS {{ z }}",
			} as unknown as Response;
		});
		// @ts-expect-error test env
		global.fetch = mock;

		const yapl = new NodeYAPL({ baseDir: ["/tmp"] });
		const res = await yapl.renderString(
			'{% include "https://example.com/x.md.yapl" %}',
			{ z: "Z" },
			"/",
		);
		expect(res.content).toBe("ABS Z");
		expect(mock).toHaveBeenCalledTimes(1);
	});

	it("handles non-ok fetch with a clear error", async () => {
		const mock = vi.fn(async (_url: string) => {
			return {
				ok: false,
				status: 404,
				text: async () => "not found",
			} as unknown as Response;
		});
		// @ts-expect-error test env
		global.fetch = mock;

		const yapl = new NodeYAPL({ baseDir: ["@awesome-yapl"] });
		await expect(
			yapl.render("@awesome-yapl/agent/base.md.yapl", {}),
		).rejects.toThrow(/Failed to fetch/);
	});

	it("resolves relative ./ include against currentDir and enforces strictPaths", async () => {
		const base = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({ baseDir: [base], strictPaths: true });
		const res = await yapl.renderString(
			'{% include "./tasks/summarize.md.yapl" %}',
			{ domain: "R" },
			base,
		);
		expect(res.content).toContain("Summarize the following text");
	});
});
