import type { Vars } from "..";

export default function getPath(obj: Vars, dotted: string): unknown {
	return dotted.split(".").reduce<unknown>((acc, key) => {
		if (
			acc &&
			typeof acc === "object" &&
			key in (acc as Record<string, unknown>)
		)
			return (acc as Record<string, unknown>)[key];
		return undefined;
	}, obj);
}
