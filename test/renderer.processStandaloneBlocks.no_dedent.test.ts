import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("processStandaloneBlocks without dedent", () => {
	it("keeps indentation inside block", async () => {
		const yapl = new YAPL({
			baseDir: "/",
			whitespace: { dedentBlocks: false },
		});
		const tpl = "{% block a %}\n  LINE\n{% endblock %}";
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("  LINE\n");
	});
});
