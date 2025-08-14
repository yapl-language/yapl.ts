import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("YAPLRenderer constructor default whitespace options branches", () => {
  it("uses defaults when whitespace is undefined and when provided", async () => {
    const y1 = new YAPL({ baseDir: "/" });
    const res1 = await y1.renderString("A\n{% if x %}\nB\n{% endif %}\n", { x: true });
    expect(res1.content).toContain("A");

    const y2 = new YAPL({ baseDir: "/", whitespace: {} });
    const res2 = await y2.renderString("A\n{% if x %}\nB\n{% endif %}\n", { x: true });
    expect(res2.content).toContain("A");
  });
});
