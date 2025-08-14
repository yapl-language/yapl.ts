import { describe, it, expect } from "vitest";
import { YAPL } from "../src";

describe("dedentText returns original text when nonEmptyLines is empty", () => {
  it("keeps an all-whitespace block unchanged when dedent applies", async () => {
    const yapl = new YAPL({ baseDir: "/" });
    const tpl = "{%- block x -%}\n\n\n{%- endblock -%}"; // block content is empty/whitespace only
    const res = await yapl.renderString(tpl, {});
    expect(res.content).toBe("\n");
  });
});
