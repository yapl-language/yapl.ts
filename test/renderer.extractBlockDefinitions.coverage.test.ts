import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("extractBlockDefinitions coverage variants", () => {
	it("handles multiple blocks with dedent true", () => {
		const yapl = new YAPL({ baseDir: "/" });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const r: any = (yapl as any).renderer;
		const blocks = r.extractBlockDefinitions(
			"{% block a %} A \n{% endblock %}{% block b %}B{% endblock %}",
		);
		expect(blocks).toHaveProperty("a");
		expect(blocks).toHaveProperty("b");
	});

	it("handles blocks with dedent disabled", () => {
		const yapl = new YAPL({
			baseDir: "/",
			whitespace: { dedentBlocks: false },
		});
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const r: any = (yapl as any).renderer;
		const blocks = r.extractBlockDefinitions(
			"{% block c %}\n  C\n{% endblock %}",
		);
		expect(blocks.c).toBe("\n  C\n");
	});
});
