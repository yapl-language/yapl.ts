import { describe, expect, it } from "vitest";
import evaluateCondition from "../src/utils/evaluateCondition";

describe("evaluateCondition - Enhanced Operators", () => {
	describe("Comparison operators", () => {
		it("should handle >= (greater than or equal)", () => {
			expect(evaluateCondition("age >= 18", { age: 18 })).toBe(true);
			expect(evaluateCondition("age >= 18", { age: 25 })).toBe(true);
			expect(evaluateCondition("age >= 18", { age: 16 })).toBe(false);
		});

		it("should handle <= (less than or equal)", () => {
			expect(evaluateCondition("score <= 100", { score: 100 })).toBe(true);
			expect(evaluateCondition("score <= 100", { score: 85 })).toBe(true);
			expect(evaluateCondition("score <= 100", { score: 105 })).toBe(false);
		});

		it("should handle > (greater than)", () => {
			expect(evaluateCondition("temperature > 30", { temperature: 35 })).toBe(true);
			expect(evaluateCondition("temperature > 30", { temperature: 30 })).toBe(false);
			expect(evaluateCondition("temperature > 30", { temperature: 25 })).toBe(false);
		});

		it("should handle < (less than)", () => {
			expect(evaluateCondition("count < 10", { count: 5 })).toBe(true);
			expect(evaluateCondition("count < 10", { count: 10 })).toBe(false);
			expect(evaluateCondition("count < 10", { count: 15 })).toBe(false);
		});

		it("should handle string comparisons", () => {
			expect(evaluateCondition('version >= "2.0"', { version: "2.1" })).toBe(true);
			expect(evaluateCondition('version >= "2.0"', { version: "1.9" })).toBe(false);
		});

		it("should handle decimal numbers", () => {
			expect(evaluateCondition("price >= 19.99", { price: 20.00 })).toBe(true);
			expect(evaluateCondition("price >= 19.99", { price: 19.50 })).toBe(false);
		});
	});

	describe("Literal boolean values", () => {
		it("should handle literal true", () => {
			expect(evaluateCondition("true", {})).toBe(true);
		});

		it("should handle literal false", () => {
			expect(evaluateCondition("false", {})).toBe(false);
		});
	});

	describe("Complex conditions with new operators", () => {
		it("should handle multiple comparison operators in logical expressions", () => {
			expect(evaluateCondition("age >= 18 and score > 80", { age: 25, score: 85 })).toBe(true);
			expect(evaluateCondition("age >= 18 and score > 80", { age: 16, score: 85 })).toBe(false);
			expect(evaluateCondition("age >= 18 and score > 80", { age: 25, score: 75 })).toBe(false);
		});

		it("should handle OR conditions with comparisons", () => {
			expect(evaluateCondition("score >= 90 or bonus_points > 10", { score: 95, bonus_points: 5 })).toBe(true);
			expect(evaluateCondition("score >= 90 or bonus_points > 10", { score: 85, bonus_points: 15 })).toBe(true);
			expect(evaluateCondition("score >= 90 or bonus_points > 10", { score: 85, bonus_points: 5 })).toBe(false);
		});
	});

	describe("Edge cases", () => {
		it("should handle undefined variables in comparisons", () => {
			expect(evaluateCondition("missing_var >= 10", {})).toBe(false);
		});

		it("should handle null values", () => {
			// Note: Number(null) returns 0, so null >= 0 is true
			expect(evaluateCondition("value >= 0", { value: null })).toBe(true);
			expect(evaluateCondition("value > 0", { value: null })).toBe(false);
		});

		it("should handle zero values", () => {
			expect(evaluateCondition("count >= 0", { count: 0 })).toBe(true);
			expect(evaluateCondition("count > 0", { count: 0 })).toBe(false);
		});

		it("should handle negative numbers", () => {
			expect(evaluateCondition("temperature >= -5", { temperature: -3 })).toBe(true);
			expect(evaluateCondition("temperature >= -5", { temperature: -10 })).toBe(false);
		});
	});
});