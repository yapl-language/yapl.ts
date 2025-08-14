import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

// Hit replaceAsync code paths for zero matches and a single match

describe("replaceAsync edge cases", () => {
	it("returns original string when no matches", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const res = await (yapl as any).renderer.replaceAsync(
			"plain",
			/NO_MATCH/g,
			async () => "X",
		);
		expect(res).toBe("plain");
	});

	it("replaces a single match", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const res = await (yapl as any).renderer.replaceAsync(
			"A{{x}}B",
			/\{\{x\}\}/g,
			async () => "Y",
		);
		expect(res).toBe("AYB");
	});
});
