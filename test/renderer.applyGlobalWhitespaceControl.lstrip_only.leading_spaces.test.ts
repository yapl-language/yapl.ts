import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("applyGlobalWhitespaceControl - lstripBlocks only leading spaces before control tags", () => {
	it("strips spaces before {% when lstripBlocks=true and trimBlocks=false", async () => {
		const renderer = new YAPLRenderer({
			whitespace: { lstripBlocks: true, trimBlocks: false, dedentBlocks: true },
		});
		const tpl = "   {% if true %}X{% endif %}";
		const res = await renderer.renderString(tpl, {});
		expect(res.content).toBe("X");
	});
});
