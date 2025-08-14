import { describe, expect, it } from "vitest";
import evaluate from "../src/utils/evaluateCondition";

describe("evaluateCondition single-quoted strings", () => {
	const vars = { x: "a" };
	it("supports single quotes in equality", () => {
		expect(evaluate("x == 'a'", vars)).toBe(true);
		expect(evaluate("x != 'b'", vars)).toBe(true);
	});
});
