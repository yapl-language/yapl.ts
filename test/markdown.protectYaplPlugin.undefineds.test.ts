import { describe, it, expect } from "vitest";
import protectYaplPlugin from "../src/markdown/protectYaplPlugin";

describe("protectYaplPlugin undefined token fields and original rules", () => {
  it("handles undefined info/content and falls back to renderToken for all three rules", () => {
    const md: any = {
      renderer: {
        rules: {
          // No original implementations to force fallback to self.renderToken
        },
      },
    };
    protectYaplPlugin(md);

    // Fence with undefined info/content values should not throw and should wrap when content has delimiters (empty here -> no wrap)
    const fenceHtml = md.renderer.rules.fence(
      [{ info: undefined, content: undefined }],
      0,
      {},
      {},
      { renderToken: () => "<pre><code>noop</code></pre>" },
    );
    expect(fenceHtml).toBe("<pre><code>noop</code></pre>");

    // Now with delimiters in content it should wrap
    const fenceHtml2 = md.renderer.rules.fence(
      [{ info: undefined, content: "{{ x }}" }],
      0,
      {},
      {},
      { renderToken: () => "<pre><code>{{ x }}</code></pre>" },
    );
    expect(fenceHtml2).toContain("v-pre");

    const blockHtml = md.renderer.rules.code_block(
      [{ content: undefined }],
      0,
      {},
      {},
      { renderToken: () => "<pre><code>noop</code></pre>" },
    );
    expect(blockHtml).toBe("<pre><code>noop</code></pre>");

    const inlineHtml = md.renderer.rules.code_inline(
      [{ content: undefined }],
      0,
      {},
      {},
      { renderToken: () => "<code>noop</code>" },
    );
    expect(inlineHtml).toBe("<code>noop</code>");
  });
});
