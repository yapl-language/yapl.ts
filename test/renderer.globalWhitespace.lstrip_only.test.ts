import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("applyGlobalWhitespaceControl lstripBlocks-only branch", () => {
  it("removes leading spaces before tags when trimBlocks=false and lstripBlocks=true", async () => {
    const yapl = new YAPL({ baseDir: "/", whitespace: { lstripBlocks: true, trimBlocks: false } });
    const tpl = "  {% if x %}A{% endif %}";
    const res = await yapl.renderString(tpl, { x: true });
    expect(res.content).toBe("A");
  });
});
