import type { Vars } from "..";
import getPath from "./getPath";

export default function parseWithObject(
	literal: string,
	parentVars: Vars,
): Vars {
	// literal is a JSON-like object with support for bare identifiers as variable references.
	// Example: {"lang":"en","name": user.name, "flag": true, "n": 3}
	// Strategy: tokenize values; if unquoted identifier -> look up in parentVars.
	type Token = { k: string; v: string };
	const tokens: Token[] = [];
	// naive parse that handles strings, numbers, booleans, null, identifiers
	const inner = literal.trim().replace(/^\{|\}$/g, "");
	if (!inner.trim()) return {};
	// split on commas not inside quotes
	const parts: string[] = [];
	let cur = "";
	let inStr: string | null = null;
	let esc = false;
	for (const ch of inner) {
		if (inStr) {
			if (esc) {
				cur += ch;
				esc = false;
				continue;
			}
			if (ch === "\\") {
				cur += ch;
				esc = true;
				continue;
			}
			if (ch === inStr) {
				inStr = null;
				cur += ch;
				continue;
			}
			cur += ch;
			continue;
		}
		if (ch === '"' || ch === "'") {
			inStr = ch;
			cur += ch;
			continue;
		}
		if (ch === ",") {
			parts.push(cur.trim());
			cur = "";
			continue;
		}
		cur += ch;
	}
	if (cur.trim()) parts.push(cur.trim());
	for (const p of parts) {
		const m = p.match(/^\s*("?)([A-Za-z0-9_.-]+)\1\s*:\s*(.+)\s*$/);
		if (!m) continue;
		const key = m[2];
		const raw = m[3];
		tokens.push({ k: key, v: raw });
	}
	const out: Vars = {};
	for (const { k, v } of tokens) {
		const trimmed = v.trim();
		// string?
		if (
			(trimmed.startsWith('"') && trimmed.endsWith('"')) ||
			(trimmed.startsWith("'") && trimmed.endsWith("'"))
		) {
			out[k] = trimmed.slice(1, -1);
			continue;
		}
		// number?
		if (/^-?\d+(\.\d+)?$/.test(trimmed)) {
			out[k] = Number(trimmed);
			continue;
		}
		// boolean/null?
		if (trimmed === "true") {
			out[k] = true;
			continue;
		}
		if (trimmed === "false") {
			out[k] = false;
			continue;
		}
		if (trimmed === "null") {
			out[k] = null;
			continue;
		}
		// identifier -> lookup in parent vars
		out[k] = getPath(parentVars, trimmed);
	}
	return out;
}
