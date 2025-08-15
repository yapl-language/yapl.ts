import { describe, it, expect } from "vitest";
import parseWithObject from "../src/utils/parseWithObject";

describe("parseWithObject branches for single vs double quoted strings", () => {
	it("parses single-quoted and double-quoted strings", () => {
		const parent = {};
		const literal = `{"a": "double", "b": 'single'}`;
		const out = parseWithObject(literal, parent);
		expect(out).toEqual({ a: "double", b: "single" });
	});
});
