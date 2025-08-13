import { describe, it, expect, vi } from "vitest";
import { YAPL } from "../src";
import { NodeYAPL } from "../src/node";
import { promises as fs } from "node:fs";

describe("YAPL", () => {
  it("should instantiate base YAPL for renderString", () => {
    expect(new YAPL({ baseDir: "../tests/prompts" })).toBeDefined();
  });

  it("should render a template string with renderString", async () => {
    const yapl = new YAPL({ baseDir: "../tests/prompts" });
    const tpl = "Hello, {{ name }}!";
    const result = await yapl.renderString(tpl, { name: "World" });
    expect(result.content).toContain("Hello, World");
  });

  it("should render a file using NodeYAPL", async () => {
    const yapl = new NodeYAPL({ baseDir: "./test/prompts" });
    // This test expects the file to exist in test/prompts/tasks/summarize.md.yapl
    const result = await yapl.render("tasks/summarize.md.yapl", {
      domain: "test",
    });
    expect(result.content).toBeDefined();
    expect(result.usedFiles.length).toBeGreaterThan(0);
  });
  it("should throw an error for missing template file in NodeYAPL", async () => {
    const yapl = new NodeYAPL({ baseDir: "./test/prompts" });
    await expect(yapl.render("tasks/does-not-exist.md.yapl")).rejects.toThrow();
  });

  it("should throw if template path escapes baseDir with strictPaths", async () => {
    const yapl = new NodeYAPL({ baseDir: "./test/prompts", strictPaths: true });
    await expect(yapl.render("../outside.md.yapl")).rejects.toThrow(
      /escapes baseDir/
    );
  });

  it("should throw on recursion depth exceeded", async () => {
    // Use NodeYAPL but point include to a template that includes itself
    const yapl = new NodeYAPL({ baseDir: "./test/prompts", maxDepth: 1 });
    // Create a tiny self-recursive template via renderString currentDir; we can't write files here,
    // so simulate by including a real template that itself includes another to exceed depth.
    const tpl = '{% include "tasks/summarize.md.yapl" %}';
    await expect(yapl.renderString(tpl, {}, "./test/prompts")).rejects.toThrow(
      /Max template depth exceeded/
    );
  });

  it("should respect whitespace options", async () => {
    const tpl = "{%- block test -%}\n    Indented\n  {%- endblock -%}";
    const yapl = new YAPL({
      baseDir: "./test/prompts",
      whitespace: { trimBlocks: true, lstripBlocks: true, dedentBlocks: true },
    });
    const result = await yapl.renderString(tpl);
    expect(result.content).toContain("Indented");
    expect(result.content).not.toMatch(/^\s{2,}/m);
  });

  it("should interpolate variables and use defaults", async () => {
    const tpl = "Hello, {{ name | default('guest') }}!";
    const yapl = new YAPL({ baseDir: "./test/prompts" });
    const result1 = await yapl.renderString(tpl, { name: "Nils" });
    const result2 = await yapl.renderString(tpl, {});
    expect(result1.content).toContain("Hello, Nils!");
    expect(result2.content).toContain("Hello, guest!");
  });

  it("should handle if/else conditionals", async () => {
    const tpl = `{% if show %}Visible{% else %}Hidden{% endif %}`;
    const yapl = new YAPL({ baseDir: "./test/prompts" });
    const result1 = await yapl.renderString(tpl, { show: true });
    const result2 = await yapl.renderString(tpl, { show: false });
    expect(result1.content).toContain("Visible");
    expect(result2.content).toContain("Hidden");
  });

  it("should support mixins and inheritance (integration)", async () => {
    const yapl = new NodeYAPL({ baseDir: "./test/prompts" });
    const result = await yapl.render("tasks/summarize.md.yapl", {
      domain: "integration test",
      sentences: 2,
      text: "Test text.",
    });
    expect(result.content).toContain(
      "You specialize in summarization for integration test"
    );
    expect(result.content).toContain(
      "Summarize the following text in 2 sentences"
    );
    expect(result.content).toContain("Test text.");
  });

  it("should cache file contents if enabled", async () => {
    const yapl = new NodeYAPL({ baseDir: "./test/prompts", cache: true });
    const spy = vi.spyOn(fs, "readFile");
    await yapl.render("tasks/summarize.md.yapl", { domain: "cache test" });
    const callsAfterFirst = spy.mock.calls.length;
    await yapl.render("tasks/summarize.md.yapl", { domain: "cache test" });
    const callsAfterSecond = spy.mock.calls.length;
    // No additional fs reads on second render (all files cached)
    expect(callsAfterSecond).toBe(callsAfterFirst);
    spy.mockRestore();
  });
});
