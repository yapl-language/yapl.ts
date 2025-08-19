import { describe, expect, it, vi } from "vitest";
import * as path from "node:path";
import { NodeYAPL } from "../src/node";

// This test ensures that includes from within a file also honor multiple baseDirs and alias resolution

describe("Renderer include honors multi baseDirs and alias", () => {
	it("include finds file in second baseDir when not present in first", async () => {
		const base1 = path.resolve("./test/prompts");
		const base2 = path.resolve("./test/prompts_second");
		const fs = await import("node:fs/promises");
		await fs.mkdir(path.join(base2, "components"), { recursive: true });
		await fs.writeFile(
			path.join(base2, "components/snippet.md.yapl"),
			"SNIPPET: {{ x }}",
		);

		const yapl = new NodeYAPL({ baseDir: [base1, base2] });
		const res = await yapl.renderString(
			'{% include "components/snippet.md.yapl" %}',
			{ x: "ok" },
			base1,
		);
		expect(res.content).toBe("SNIPPET: ok");
	});

	it("include via @awesome-yapl alias uses fetch", async () => {
		const mock = vi.fn(async (url: string) => {
			// Two fetches may occur for include chain; accept any URL containing awesome-yapl
			expect(url).toContain(
				"awesome-yapl/main/prompts/components/remote.md.yapl",
			);
			return {
				ok: true,
				status: 200,
				text: async () => "REMOTE {{ y }}",
			} as unknown as Response;
		});
		// @ts-expect-error test env
		global.fetch = mock;

		const yapl = new NodeYAPL({ baseDir: ["@awesome-yapl"] });
		const res = await yapl.renderString(
			'{% include "@awesome-yapl/components/remote.md.yapl" %}',
			{ y: "Y" },
			"/",
		);
		expect(res.content).toBe("REMOTE Y");
		expect(mock).toHaveBeenCalledTimes(1);
	});
});
