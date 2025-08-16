import { describe, it, expect, vi } from "vitest";
import evaluateCondition from "../src/utils/evaluateCondition";

// This test forces the comparison operator switch to hit the default branch
// by intercepting String.prototype.match for the specific comparison regex
// and returning an unsupported operator ("===").
describe("evaluateCondition - default switch branch in comparison operators", () => {
	it("returns false for unsupported operator (forced via match spy)", () => {
		const expr = "1 === 2";

		const originalMatch = String.prototype.match;
		const spy = vi
			.spyOn(String.prototype as any, "match")
			.mockImplementation(function (this: string, re: any) {
				// Only intercept the comparison operators regex on our specific expression
				if (
					this === expr &&
					re instanceof RegExp &&
					re.source === "^(.+?)\\s*(>=|<=|==|!=|>|<)\\s*(.+)$"
				) {
					// Simulate a regex match with an unsupported operator '===' so switch hits default
					return [expr, "1", "===", "2"] as unknown as RegExpMatchArray;
				}
				return originalMatch.call(this, re);
			});

		try {
			expect(evaluateCondition(expr, {})).toBe(false);
		} finally {
			spy.mockRestore();
		}
	});
});
