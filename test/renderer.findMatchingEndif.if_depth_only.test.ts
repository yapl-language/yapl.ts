import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("findMatchingEndif 'if' branch depth increment is executed", () => {
  it("handles nested if increasing depth even if inner never closes (break path)", async () => {
    const yapl = new YAPL({ baseDir: "/" });
    // inner if never closes -> scanner will break via no next tag, leaving content unchanged
    const tpl = "{% if a %}X{% if b %}Y";
    const res = await yapl.renderString(tpl, { a: true, b: true });
    expect(res.content).toBe(tpl);
  });
});
