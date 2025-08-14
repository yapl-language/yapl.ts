import { describe, expect, it } from "vitest";
import normalizeList from "../src/utils/normalizeList";

describe("normalizeList", () => {
	it("returns empty array when no quoted items present", () => {
		expect(normalizeList("no, quoted, items")).toEqual([]);
	});

	it("parses single quoted item list", () => {
		expect(normalizeList('"only"')).toEqual(["only"]);
	});
});
