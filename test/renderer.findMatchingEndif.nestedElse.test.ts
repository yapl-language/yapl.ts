import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("findMatchingEndif handles nested else branches", () => {
	it("ignores nested else while searching for outer endif", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "{% if x %}{% if y %}Y{% else %}N{% endif %} OUTER{% endif %}";
		const res1 = await yapl.renderString(tpl, { x: true, y: true });
		expect(res1.content).toBe("Y OUTER");
		const res2 = await yapl.renderString(tpl, { x: true, y: false });
		expect(res2.content).toBe("N OUTER");
	});
});
