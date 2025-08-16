import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("applyGlobalWhitespaceControl - both options", () => {
	it("applies lstrip and trim together", async () => {
		const renderer = new YAPLRenderer({
			whitespace: { lstripBlocks: true, trimBlocks: true, dedentBlocks: true },
		});
		const tpl = "   {% if true %}\nY\n{% endif %}\n";
		const res = await renderer.renderString(tpl, {});
		// Leading spaces removed before {% and trailing newline after %} removed
		expect(res.content).toBe("Y");
	});
});
