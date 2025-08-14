import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("YAPL comments", () => {
	it("should strip simple comments", async () => {
		const yapl = new YAPL({ baseDir: "." });
		const tpl = "Hello {# this is a comment #}World";
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("Hello World");
	});

	it("should support whitespace-trim variant {#- -#}", async () => {
		const yapl = new YAPL({ baseDir: "." });
		const tpl = "Hello\n{#- comment -#}\nWorld";
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("Hello\nWorld");
	});

	it("should not break directives around comments", async () => {
		const yapl = new YAPL({ baseDir: "." });
		const tpl = "{% if show %}Yes{# hidden #}{% else %}No{% endif %}";
		const res1 = await yapl.renderString(tpl, { show: true });
		const res2 = await yapl.renderString(tpl, { show: false });
		expect(res1.content).toBe("Yes");
		expect(res2.content).toBe("No");
	});

	it("should allow comments inside blocks and includes", async () => {
		const yapl = new YAPL({ baseDir: "./test/prompts" });
		const tpl = "{% block x %}A{# b #}B{% endblock %}";
		const res = await yapl.renderString(tpl);
		expect(res.content).toBe("AB");
	});
});
