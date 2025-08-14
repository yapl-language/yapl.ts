import { describe, it, expect } from "vitest";
import parseWithObject from "../src/utils/parseWithObject";

describe("parseWithObject skips invalid key/value pairs", () => {
  it("ignores entries that do not match key:value shape", () => {
    const parent = { a: 1 };
    const literal = "{ not-a-pair, 'bad': }"; // none of these are valid pairs
    const out = parseWithObject(literal, parent);
    expect(out).toEqual({});
  });
});
