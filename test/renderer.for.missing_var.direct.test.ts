import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("renderer.for direct variable - missing/undefined var returns empty array", () => {
	it("handles undefined direct var by returning [] (no iterations)", async () => {
		const tpl = "before-{% for v in missing %}X{% endfor %}-after";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, {});
		expect(res.content).toBe("before--after");
	});

	it("handles null direct var by returning [] (no iterations)", async () => {
		const tpl = "{% for v in nully %}X{% endfor %}";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, { nully: null });
		expect(res.content).toBe("");
	});
});
