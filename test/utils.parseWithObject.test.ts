import { describe, expect, it } from "vitest";
import parseWithObject from "../src/utils/parseWithObject";

const parent = {
	lang: "en",
	user: { name: "Ada", age: 36 },
	truth: true,
	n: 3,
	empty: "",
	nested: { value: "x" },
};

describe("parseWithObject", () => {
	it("parses strings, numbers, booleans, nulls, and identifiers", () => {
		const literal =
			'{"a":"x","b": 2, "c": true, "d": false, "e": null, "f": user.name, "g": lang, "h": n }';
		const out = parseWithObject(literal, parent);
		expect(out).toEqual({
			a: "x",
			b: 2,
			c: true,
			d: false,
			e: null,
			f: "Ada",
			g: "en",
			h: 3,
		});
	});

	it("handles commas inside strings and simple quoted keys", () => {
		const literal = '{"k":"a,b,c","quoted": "ok"}';
		const out = parseWithObject(literal, parent);
		expect(out).toEqual({ k: "a,b,c", quoted: "ok" });
	});

	it("returns empty object for empty inner literal", () => {
		const out = parseWithObject("{}", parent);
		expect(out).toEqual({});
	});
});
