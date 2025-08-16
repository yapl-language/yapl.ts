import { describe, it, expect, vi } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("renderer.for array literal with JSON.parse returning non-array", () => {
	it("rethrows a specific error when JSON.parse returns a non-array", async () => {
		const original = JSON.parse;
		const spy = vi
			.spyOn(JSON, "parse")
			.mockImplementation(() => ({ foo: "bar" }) as any);
		try {
			const tpl = "{% for x in [1,2,3] %}{{ x }}{% endfor %}";
			const renderer = new YAPLRenderer();
			await expect(renderer.renderString(tpl, {})).rejects.toThrow(
				/For loop iterable must be an array, got: object/,
			);
		} finally {
			spy.mockRestore();
			// ensure JSON.parse is restored
			expect(JSON.parse).toBe(original);
		}
	});
});
