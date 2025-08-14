import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("mergeBlocksWithSuper with missing base block", () => {
	it("replaces super() with empty string when base missing", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		const tpl = "{% block a %}X{{ super() }}Y{% endblock %}";
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("XY");
	});
});
