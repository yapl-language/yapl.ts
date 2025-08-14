import { describe, expect, it } from "vitest";
import parseWithObject from "../src/utils/parseWithObject";

describe("parseWithObject escape sequences in strings", () => {
	it("handles escaped quotes and backslashes", () => {
		const parent = {};
		const literal = '{"a":"line with \\"quote\\" and \\\\ backslash"}';
		const out = parseWithObject(literal, parent);
		expect(out).toEqual({ a: 'line with \\"quote\\" and \\\\ backslash' });
	});
});
