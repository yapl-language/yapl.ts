import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("renderString uses baseDir when currentDir is undefined (?? operator branch)", () => {
	it("falls back to baseDir when currentDir is not provided", async () => {
		const yapl = new YAPL({ baseDir: "/base" });
		const res = await yapl.renderString("Hello");
		expect(res.content).toBe("Hello");
	});
});
