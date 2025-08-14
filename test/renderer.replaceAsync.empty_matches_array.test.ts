import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

// Ensures code path where matches array is empty (no loop iterations) still returns content
// This overlaps with previous test but direct intent is to cover the explicit path created by Array.from(matchAll)
describe("replaceAsync with empty matches array returns original content", () => {
  it("no INCLUDE/MIXIN/EXTENDS in template", async () => {
    const yapl = new YAPL({ baseDir: "/" });
    const tpl = "plain text only";
    const res = await yapl.renderString(tpl);
    expect(res.content).toBe(tpl);
  });
});
