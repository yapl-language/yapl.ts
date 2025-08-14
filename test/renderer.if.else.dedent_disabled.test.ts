import { describe, expect, it } from "vitest";
import { YAPL } from "../src";

describe("Renderer if/else without dedentBlocks", () => {
	it("preserves indentation for if-true branch when dedent disabled", async () => {
		const yapl = new YAPL({
			baseDir: "/",
			whitespace: { dedentBlocks: false },
		});
		const tpl = "{% if ok %}\n  INDENT\n{% endif %}";
		const res = await yapl.renderString(tpl, { ok: true });
		expect(res.content).toBe("  INDENT\n");
	});

	it("preserves indentation for else branch when dedent disabled", async () => {
		const yapl = new YAPL({
			baseDir: "/",
			whitespace: { dedentBlocks: false },
		});
		const tpl = "{% if ok %}\n  IF\n{% else %}\n  ELSE\n{% endif %}";
		const res = await yapl.renderString(tpl, { ok: false });
		expect(res.content).toBe("  ELSE\n");
	});
});
