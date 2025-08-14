import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("applyTagTrimming removes whitespace around trim markers", () => {
	it("handles variable, control, and comment trim markers", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "X {#- a -#} {% -%} {{- x -}} Y";
		const res = await yapl.renderString(tpl, { x: "Z" });
		expect(res.content).toBe("X{% %}ZY");
	});
});
