import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("renderer.findMatchingEndif - malformed elseif (no condition)", () => {
	it("skips malformed elseif and properly falls back to else block", async () => {
		const tpl = "{% if false %}A{% elseif %}B{% else %}C{% endif %}";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, {});
		expect(res.content).toBe("C");
	});

	it("leaves malformed elseif literal inside ifContent when initial if is true", async () => {
		const tpl = "{% if true %}X{% elseif %}Y{% else %}Z{% endif %}";
		const renderer = new YAPLRenderer();
		const res = await renderer.renderString(tpl, {});
		// Because the malformed elseif isn't recognized as a separate block, it remains literal in ifContent
		expect(res.content).toBe("X{% elseif %}Y");
	});
});
