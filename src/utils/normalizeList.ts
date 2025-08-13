export default function normalizeList(listLiteral: string): string[] {
	// takes `"a", "b", "c"` or `"a"` and returns ["a","b","c"]
	const items = listLiteral.match(/"([^"]+)"/g) || [];
	return items.map((s) => s.slice(1, -1));
}
