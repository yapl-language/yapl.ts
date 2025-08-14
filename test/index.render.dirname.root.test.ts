import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

// Covers the branch in src/index.ts dirname() where no slash exists in the path
// so it falls back to "/".
describe("YAPL.render with path lacking directory uses root dirname fallback", () => {
  it("renders when resolvePath is omitted and templatePath has no slash", async () => {
    const files: Record<string, string> = {
      // No slash in key to force dirname(absolutePath) to return '/'
      "file.yapl": "Hello",
    };

    const yapl = new YAPL({
      baseDir: "/any",
      // No resolvePath provided on purpose
      loadFile: async (abs) => {
        // Ensure that ensureExtension is not applied here (render() path without resolvePath)
        return files[abs];
      },
    });

    const res = await yapl.render("file.yapl");
    expect(res.content).toBe("Hello");
  });
});
