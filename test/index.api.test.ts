import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("YAPL API browser-like wrapper", () => {
	it("renderString with no file operations and baseDir", async () => {
		const yapl = new YAPL({ baseDir: "/x" });
		const res = await yapl.renderString("Hello, {{ name }}!", {
			name: "World",
		});
		expect(res.content).toBe("Hello, World!");
		expect(Array.isArray(res.usedFiles)).toBe(true);
	});

	it("setBaseDir and resolvePath/loadFile passthroughs stay optional", async () => {
		const yapl = new YAPL({ baseDir: "/tmp" });
		await expect(
			// The browser wrapper render() must throw without loadFile
			// as file loading isn't available in that environment
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			(yapl as any).render("x"),
		).rejects.toThrow();
		yapl.setBaseDir("/new");
		const res = await yapl.renderString('{{ x | default("ok") }}');
		expect(res.content).toBe("ok");
	});
});
