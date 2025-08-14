import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("Renderer if without else false branch -> empty", () => {
	it("removes block when condition false and no else", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "A{% if cond %}X{% endif %}B";
		const res = await yapl.renderString(tpl, { cond: false });
		expect(res.content).toBe("AB");
	});
});
