import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("stripDirectives removes mixin/extends before includes", () => {
	it("ensures mixin/extends tags are stripped in non-inheritance rendering", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = '{% mixin "x" %}TEXT';
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("TEXT");
	});
});
