import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("YAPL.render success path with custom loaders", () => {
	it("renders using provided resolvePath/loadFile/ensureExtension", async () => {
		const files: Record<string, string> = {
			"/base/template.yapl": "Hello, {{ who }}!",
		};
		const yapl = new YAPL({
			baseDir: "/base",
			// ensure .yapl
			ensureExtension: (p) => (p.endsWith(".yapl") ? p : `${p}.yapl`),
			// simple resolver that returns the base path joined string without extra slashes
			resolvePath: (ref, from, ensure) =>
				ensure(`${from}/${ref}`).replace(/\\+/g, "/"),
			loadFile: async (abs) => {
				const key = abs.replace(/\\+/g, "/");
				if (!(key in files)) throw new Error("missing");
				return files[key];
			},
		});

		const res = await yapl.render("template", { who: "World" });
		expect(res.content).toBe("Hello, World!");
		expect(Array.isArray(res.usedFiles)).toBe(true);
	});
});
