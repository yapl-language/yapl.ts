import type { Vars } from "..";
import getPath from "./getPath";

/**
 * Evaluates a simple condition expression for if statements.
 * Supports basic comparisons and existence checks.
 *
 * Supported operators:
 * - == (equals)
 * - != (not equals)
 * - >= (greater than or equal)
 * - <= (less than or equal)
 * - > (greater than)
 * - < (less than)
 * - is defined (variable exists and is not null/undefined)
 * - is not defined (variable is null/undefined)
 * - is empty (variable is null/undefined/empty string/empty array)
 * - is not empty (variable has a value)
 * - and (logical AND)
 * - or (logical OR)
 *
 * Examples:
 * - user.name == "John"
 * - count != 0
 * - user.email is defined
 * - items is not empty
 * - status == "active"
 * - user.name is defined and user.name != ""
 */
export default function evaluateCondition(
	condition: string,
	vars: Vars,
): boolean {
	const trimmed = condition.trim();

	// Handle logical operators (and, or)
	const andMatch = trimmed.match(/^(.+?)\s+and\s+(.+)$/);
	if (andMatch) {
		const [, leftCondition, rightCondition] = andMatch;
		return (
			evaluateCondition(leftCondition.trim(), vars) &&
			evaluateCondition(rightCondition.trim(), vars)
		);
	}

	const orMatch = trimmed.match(/^(.+?)\s+or\s+(.+)$/);
	if (orMatch) {
		const [, leftCondition, rightCondition] = orMatch;
		return (
			evaluateCondition(leftCondition.trim(), vars) ||
			evaluateCondition(rightCondition.trim(), vars)
		);
	}

	// Handle "is defined" / "is not defined"
	const isDefinedMatch = trimmed.match(/^(.+?)\s+is\s+(not\s+)?defined$/);
	if (isDefinedMatch) {
		const [, varPath, notModifier] = isDefinedMatch;
		const value = getPath(vars, varPath.trim());
		const isDefined = value !== undefined && value !== null;
		return notModifier ? !isDefined : isDefined;
	}

	// Handle "is empty" / "is not empty"
	const isEmptyMatch = trimmed.match(/^(.+?)\s+is\s+(not\s+)?empty$/);
	if (isEmptyMatch) {
		const [, varPath, notModifier] = isEmptyMatch;
		const value = getPath(vars, varPath.trim());
		const isEmpty =
			value === undefined ||
			value === null ||
			value === "" ||
			(Array.isArray(value) && value.length === 0) ||
			(typeof value === "object" && Object.keys(value).length === 0);
		return notModifier ? !isEmpty : isEmpty;
	}

	// Handle all comparison operators (==, !=, >=, <=, >, <)
	const comparisonMatch = trimmed.match(/^(.+?)\s*(>=|<=|==|!=|>|<)\s*(.+)$/);
	if (comparisonMatch) {
		const [, leftExpr, operator, rightExpr] = comparisonMatch;
		const leftValue = parseValue(leftExpr.trim(), vars);
		const rightValue = parseValue(rightExpr.trim(), vars);

		switch (operator) {
			case "==":
				return leftValue === rightValue;
			case "!=":
				return leftValue !== rightValue;
			case ">=":
				return Number(leftValue) >= Number(rightValue);
			case "<=":
				return Number(leftValue) <= Number(rightValue);
			case ">":
				return Number(leftValue) > Number(rightValue);
			case "<":
				return Number(leftValue) < Number(rightValue);
			default:
				return false;
		}
	}

	// Handle literal boolean values
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;

	// Handle simple truthiness check (just a variable name)
	const simpleVarMatch = trimmed.match(/^[a-zA-Z0-9_.]+$/);
	if (simpleVarMatch) {
		const value = getPath(vars, trimmed);
		return Boolean(value);
	}

	// If we can't parse the condition, default to false for safety
	return false;
}

/**
 * Parse a value expression - could be a variable reference, string literal, number, or boolean
 */
function parseValue(expr: string, vars: Vars): unknown {
	const trimmed = expr.trim();

	// String literal (quoted)
	if (
		(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
		(trimmed.startsWith("'") && trimmed.endsWith("'"))
	) {
		return trimmed.slice(1, -1);
	}

	// Number literal
	if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
		return Number(trimmed);
	}

	// Boolean literal
	if (trimmed === "true") return true;
	if (trimmed === "false") return false;
	if (trimmed === "null") return null;

	// Variable reference
	return getPath(vars, trimmed);
}
