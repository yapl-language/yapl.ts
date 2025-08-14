import { describe, expect, it } from "vitest";
import evaluate from "../src/utils/evaluateCondition";

const vars = {
	user: { name: "John", age: 30, tags: ["a"], obj: { k: "v" } },
	count: 0,
	enabled: true,
	disabled: false,
	text: "",
	num: 42,
	nothing: null,
};

describe("evaluateCondition", () => {
	it("truthiness of simple var", () => {
		expect(evaluate("enabled", vars)).toBe(true);
		expect(evaluate("disabled", vars)).toBe(false);
		expect(evaluate("missing", vars)).toBe(false);
	});

	it("equality and inequality", () => {
		expect(evaluate('user.name == "John"', vars)).toBe(true);
		expect(evaluate('user.name != "Jane"', vars)).toBe(true);
		expect(evaluate("num == 42", vars)).toBe(true);
		expect(evaluate("num != 0", vars)).toBe(true);
		expect(evaluate("enabled == true", vars)).toBe(true);
		expect(evaluate("disabled == false", vars)).toBe(true);
		expect(evaluate("nothing == null", vars)).toBe(true);
	});

	it("is defined / is not defined", () => {
		expect(evaluate("user.name is defined", vars)).toBe(true);
		expect(evaluate("missing is defined", vars)).toBe(false);
		expect(evaluate("missing is not defined", vars)).toBe(true);
	});

	it("is empty / is not empty", () => {
		expect(evaluate("text is empty", vars)).toBe(true);
		expect(evaluate("user.tags is not empty", vars)).toBe(true);
		expect(evaluate("user.obj is not empty", vars)).toBe(true);
	});

	it("logical and/or", () => {
		expect(evaluate('enabled and user.name == "John"', vars)).toBe(true);
		expect(evaluate("enabled and disabled", vars)).toBe(false);
		expect(evaluate("disabled or enabled", vars)).toBe(true);
	});

	it("handles unknown or unparsable as false", () => {
		expect(evaluate("(x)", vars)).toBe(false);
	});
});
