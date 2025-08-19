import { describe, expect, it, afterAll } from "vitest";
import { NodeYAPL } from "../src/node";
import * as path from "node:path";
import * as fsp from "node:fs/promises";

const tmpDir = path.resolve("./tmp_rovodev_fromdir");

describe("resolvePath fallback to fromDir when not found in baseDirs", () => {
	it("includes file from currentDir (fromDir) when not present in any baseDir", async () => {
		await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
		await fsp.mkdir(tmpDir, { recursive: true });
		await fsp.writeFile(path.join(tmpDir, "local.md.yapl"), "LOCAL {{ v }}");

		const yapl = new NodeYAPL({
			baseDir: [path.resolve("./test/prompts")],
			strictPaths: false,
		});
		const res = await yapl.renderString(
			'{% include "local.md.yapl" %}',
			{ v: "V" },
			tmpDir,
		);
		expect(res.content).toBe("LOCAL V");
	});

	afterAll(async () => {
		await fsp.rm(tmpDir, { recursive: true, force: true }).catch(() => {});
	});
});
