import { describe, it, expect } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("dedentText refactor - leading whitespace match always exists", () => {
	it("dedents lines with mixed tabs/spaces reliably", async () => {
		const renderer = new YAPLRenderer();
		const tpl = `{% block b %}\n\t  a\n\t  b\n{% endblock %}`;
		const res = await renderer.renderString(tpl, {}, "/");
		expect(res.content).toBe("a\nb");
	});
});
