import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

// cover dirname path for strings without slash

describe("renderer.dirname edge", () => {
	it("returns empty string when no slash present", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		// Access private via any for coverage
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const dirname = (yapl as any).renderer.dirname.bind((yapl as any).renderer);
		expect(dirname("filename")).toBe("");
	});
});
