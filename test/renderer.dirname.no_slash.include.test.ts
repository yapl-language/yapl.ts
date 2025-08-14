import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("renderer.dirname branch where path has no slash (empty dirname)", () => {
  it("processIncludeDirective calls dirname('file.yapl') -> ''", async () => {
    const files: Record<string, string> = {
      // Include target is a slash-less path; renderer.dirname should return ''
      "file.yapl": "OK",
    };

    const yapl = new YAPL({
      baseDir: "/base",
      ensureExtension: (p) => (p.endsWith(".yapl") ? p : `${p}.yapl`),
      resolvePath: (ref, _from, ensure) => ensure(ref), // return ref as-is (no slash)
      loadFile: async (abs) => {
        return files[abs];
      },
    });

    const res = await yapl.renderString('{% include "file" %}');
    expect(res.content).toBe("OK");
    // Nothing else to assert; this test exists to cover dirname's empty-string return branch
  });
});
