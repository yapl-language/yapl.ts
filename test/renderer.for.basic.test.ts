import { describe, expect, it } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("YAPLRenderer - For Loop Basic", () => {
	it("should render a simple for loop with array variable", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% for item in items %}{{ item }}{% endfor %}`;
		const vars = { items: ["a", "b", "c"] };

		const result = await renderer.renderString(template, vars);
		expect(result.content).toBe("abc");
	});

	it("should render for loop with object array", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% for technique in study_techniques %}- **{{ technique.name }}**: {{ technique.description }}{% endfor %}`;
		const vars = {
			study_techniques: [
				{ name: "Pomodoro", description: "25-minute focused work sessions" },
				{
					name: "Spaced Repetition",
					description: "Review material at increasing intervals",
				},
			],
		};

		const result = await renderer.renderString(template, vars);
		expect(result.content).toBe(
			`- **Pomodoro**: 25-minute focused work sessions- **Spaced Repetition**: Review material at increasing intervals`,
		);
	});

	it("should render for loop with proper newline handling", async () => {
		const renderer = new YAPLRenderer({
			baseDir: "/test",
			whitespace: {
				trimBlocks: false,
				lstripBlocks: false,
				dedentBlocks: false,
			},
		});
		const template = `{% for technique in study_techniques %}- **{{ technique.name }}**: {{ technique.description }}
{% endfor %}`;
		const vars = {
			study_techniques: [
				{ name: "Pomodoro", description: "25-minute focused work sessions" },
				{
					name: "Spaced Repetition",
					description: "Review material at increasing intervals",
				},
			],
		};

		const result = await renderer.renderString(template, vars);
		expect(result.content).toBe(`- **Pomodoro**: 25-minute focused work sessions
- **Spaced Repetition**: Review material at increasing intervals
`);
	});

	it("should handle empty arrays", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% for item in items %}{{ item }}{% endfor %}`;
		const vars = { items: [] };

		const result = await renderer.renderString(template, vars);
		expect(result.content).toBe("");
	});

	it("should handle nested for loops", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% for outer in outers %}{% for inner in inners %}{{ outer }}-{{ inner }} {% endfor %}{% endfor %}`;
		const vars = {
			outers: ["A", "B"],
			inners: ["1", "2"],
		};

		const result = await renderer.renderString(template, vars);
		expect(result.content).toBe("A-1 A-2 B-1 B-2 ");
	});

	it("should handle for loops with array literals", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% for item in ["x", "y", "z"] %}{{ item }}{% endfor %}`;
		const vars = {};

		const result = await renderer.renderString(template, vars);
		expect(result.content).toBe("xyz");
	});

	it("should throw error for non-array iterables", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% for item in notArray %}{{ item }}{% endfor %}`;
		const vars = { notArray: "string" };

		await expect(renderer.renderString(template, vars)).rejects.toThrow(
			"For loop iterable must be an array",
		);
	});
});
