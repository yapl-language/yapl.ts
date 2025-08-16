import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("applyGlobalWhitespaceControl - trimBlocks only", () => {
	it("removes trailing newline after %} when trimBlocks=true and lstripBlocks=false", async () => {
		const renderer = new YAPLRenderer({
			whitespace: { trimBlocks: true, lstripBlocks: false, dedentBlocks: true },
		});
		const tpl = "Line\n{% if true %}\nHello\n{% endif %}\nNext";
		const res = await renderer.renderString(tpl, {});
		// The newline after %} should be removed by trimBlocks for closing tags
		expect(res.content).toContain("HelloNext");
	});
});
