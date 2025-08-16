import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("renderer.for array literal manual parsing fallback", () => {
	it("parses non-JSON array literal with identifiers and quoted strings", async () => {
		const tpl =
			"{% for item in [a, '2', 3, 4.5, \"b\"] %}{{ item }}-{% endfor %}";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, {});
		// Expected items: ["a", "2", 3, 4.5, "b"]
		expect(res.content).toBe("a-2-3-4.5-b-");
	});

	it("trims spaces around comma-separated items in non-JSON array literal", async () => {
		const tpl = "{% for item in [  'x' ,  10 , y  ] %}{{ item }}{% endfor %}";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, {});
		// items: ["x", 10, "y"]
		expect(res.content).toBe("x10y");
	});
});
