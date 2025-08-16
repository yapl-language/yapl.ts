import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("renderer.for complex iterable expressions", () => {
	it("returns empty output when complex expr resolves to undefined (fallback path -> [])", async () => {
		const tpl = "{% for x in items | filter %}{{ x }}{% endfor %}";
		const renderer = new YAPLRenderer();
		const result = await renderer.renderString(tpl, { items: [1, 2, 3] });
		// complex expr 'items | filter' doesn't match simple var or array literal
		// fallback getPath returns undefined -> [] -> no iterations => empty content
		expect(result.content).toBe("");
	});

	it("resolves array when expr is a key with spaces via fallback and renders items", async () => {
		const tpl = "{% for v in items with space %}{{ v }}-{% endfor %}";
		const renderer = new YAPLRenderer();
		const result = await renderer.renderString(tpl, {
			// Use a key that includes spaces so it does not match the simple var regex
			"items with space": ["a", "b", "c"],
		});
		expect(result.content).toBe("a-b-c-");
	});

	it("throws when complex expr resolves to a non-array value via fallback", async () => {
		const tpl = "{% for k in items with space %}{{ k }}{% endfor %}";
		const renderer = new YAPLRenderer();
		await expect(
			renderer.renderString(tpl, {
				// Key with spaces exists but is not an array, should trigger the fallback non-array error
				"items with space": 42,
			}),
		).rejects.toThrow(/For loop iterable must be an array, got: number/);
	});
});
