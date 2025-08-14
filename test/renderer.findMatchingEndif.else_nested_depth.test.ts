import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("findMatchingEndif: else at nested depth does not set elseIndex", () => {
  it("handles else at depth > 0 without affecting top-level elseIndex", async () => {
    const yapl = new YAPL({ baseDir: "/" });
    // The inner else at depth 1 should not be recorded as top-level elseIndex
    const tpl = "{% if a %}{% if b %}X{% else %}Y{% endif %}{% endif %}";
    const res = await yapl.renderString(tpl, { a: true, b: true });
    expect(res.content).toBe("X");
  });
});
