import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

// Intentionally reach private internals for precise line coverage

describe("Renderer internals coverage", () => {
	it("extractBlockDefinitions assigns entries", () => {
		const yapl = new YAPL({ baseDir: "/" });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const r: any = (yapl as any).renderer;
		const blocks = r.extractBlockDefinitions("{% block a %}AA{% endblock %}");
		expect(blocks).toEqual({ a: "AA" });
	});

	it("applyBlockOverridesToParent handles else replacement path", async () => {
		const yapl = new YAPL({ baseDir: "/" });
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const r: any = (yapl as any).renderer;
		const parent = "{% block a %}PARENT{% endblock %}";
		const ctx = {
			vars: {},
			currentDir: "/",
			usedFiles: new Set<string>(),
			depth: 0,
		};
		const out = await r.applyBlockOverridesToParent(parent, {}, ctx, "/");
		expect(out.trim()).toBe("PARENT");
	});
});
