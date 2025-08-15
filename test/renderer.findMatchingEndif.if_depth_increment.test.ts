import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("findMatchingEndif 'if' branch increments depth", () => {
	it("handles nested if increasing depth and then closing", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "{% if a %}X{% if b %}Y{% endif %}Z{% endif %}";
		const res = await yapl.renderString(tpl, { a: true, b: true });
		expect(res.content).toBe("XYZ");
	});
});
