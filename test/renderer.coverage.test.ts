import { describe, expect, it } from "vitest";
import { YAPL } from "../src";
import { NodeYAPL } from "../src/node";

describe("Renderer coverage extras", () => {
	it("handles mixins merging and super() replacement without extends", async () => {
		const yapl = new YAPL({ baseDir: "." });
		const tpl =
			'{% mixin "./test/prompts/mixins/safety.md.yapl" %}\n{% block guidance %}Before {{ super() }} After{% endblock %}';
		// with no extends, blocks are processed standalone, but super() inside child block should be removed later
		const res = await yapl.renderString(tpl, {}, "./");
		// Since there is no extends, the block content should just render with super() stripped
		expect(res.content).toContain("Before  After");
	});

	it("processes nested if/else correctly and stops iterating", async () => {
		const yapl = new YAPL({ baseDir: "." });
		const tpl = "{% if a %}X{% if b %}Y{% endif %}{% else %}Z{% endif %}";
		const res1 = await yapl.renderString(tpl, { a: true, b: true });
		expect(res1.content).toBe("XY");
		const res2 = await yapl.renderString(tpl, { a: true, b: false });
		expect(res2.content).toBe("X");
		const res3 = await yapl.renderString(tpl, { a: false });
		expect(res3.content).toBe("Z");
	});

	it("handles SUPER within overrides when extending a parent", async () => {
		const yapl = new NodeYAPL({ baseDir: "./test/prompts" });
		const res = await yapl.render("tasks/summarize.md.yapl", { domain: "x" });
		expect(res.content).toContain("You specialize in summarization");
	});
});
