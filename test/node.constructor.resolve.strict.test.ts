import * as path from "node:path";
import { describe, expect, it } from "vitest";
import { NodeYAPL } from "../src/node";

describe("NodeYAPL constructor resolvePath strictPaths during include", () => {
	it("throws when include resolves outside baseDir", async () => {
		const baseDir = path.resolve("./test/prompts");
		const yapl = new NodeYAPL({ baseDir, strictPaths: true });
		const tpl = '{% include "../outside" %}'; // ensureExtension makes it .yapl
		await expect(yapl.renderString(tpl, {}, baseDir)).rejects.toThrow(
			/escapes baseDir/,
		);
	});
});
