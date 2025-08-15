import { describe, expect, it } from "vitest";
import { YAPLRenderer } from "../src/renderer";

describe("YAPLRenderer - ElseIf Conditionals", () => {
	it("should handle simple elseif statement", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if score >= 90 %}A{% elseif score >= 80 %}B{% elseif score >= 70 %}C{% else %}F{% endif %}`;

		const result1 = await renderer.renderString(template, { score: 95 });
		expect(result1.content).toBe("A");

		const result2 = await renderer.renderString(template, { score: 85 });
		expect(result2.content).toBe("B");

		const result3 = await renderer.renderString(template, { score: 75 });
		expect(result3.content).toBe("C");

		const result4 = await renderer.renderString(template, { score: 65 });
		expect(result4.content).toBe("F");
	});

	it("should handle elseif without else", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if user.role == "admin" %}Admin Panel{% elseif user.role == "moderator" %}Mod Panel{% endif %}`;

		const result1 = await renderer.renderString(template, {
			user: { role: "admin" },
		});
		expect(result1.content).toBe("Admin Panel");

		const result2 = await renderer.renderString(template, {
			user: { role: "moderator" },
		});
		expect(result2.content).toBe("Mod Panel");

		const result3 = await renderer.renderString(template, {
			user: { role: "user" },
		});
		expect(result3.content).toBe("");
	});

	it("should handle multiple elseif conditions", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if day == "monday" %}Start of work week{% elseif day == "tuesday" %}Tuesday blues{% elseif day == "wednesday" %}Hump day{% elseif day == "thursday" %}Almost there{% elseif day == "friday" %}TGIF{% else %}Weekend!{% endif %}`;

		const result1 = await renderer.renderString(template, { day: "monday" });
		expect(result1.content).toBe("Start of work week");

		const result2 = await renderer.renderString(template, { day: "wednesday" });
		expect(result2.content).toBe("Hump day");

		const result3 = await renderer.renderString(template, { day: "friday" });
		expect(result3.content).toBe("TGIF");

		const result4 = await renderer.renderString(template, { day: "saturday" });
		expect(result4.content).toBe("Weekend!");
	});

	it("should handle elseif with complex conditions", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if user.age >= 65 %}Senior{% elseif user.age >= 18 %}Adult{% elseif user.age >= 13 %}Teen{% else %}Child{% endif %}`;

		const result1 = await renderer.renderString(template, {
			user: { age: 70 },
		});
		expect(result1.content).toBe("Senior");

		const result2 = await renderer.renderString(template, {
			user: { age: 25 },
		});
		expect(result2.content).toBe("Adult");

		const result3 = await renderer.renderString(template, {
			user: { age: 16 },
		});
		expect(result3.content).toBe("Teen");

		const result4 = await renderer.renderString(template, { user: { age: 8 } });
		expect(result4.content).toBe("Child");
	});

	it("should handle nested elseif statements", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if user.active %}{% if user.role == "admin" %}Active Admin{% elseif user.role == "user" %}Active User{% endif %}{% else %}Inactive{% endif %}`;

		const result1 = await renderer.renderString(template, {
			user: { active: true, role: "admin" },
		});
		expect(result1.content).toBe("Active Admin");

		const result2 = await renderer.renderString(template, {
			user: { active: true, role: "user" },
		});
		expect(result2.content).toBe("Active User");

		const result3 = await renderer.renderString(template, {
			user: { active: false, role: "admin" },
		});
		expect(result3.content).toBe("Inactive");
	});

	it("should handle elseif with multiline content", async () => {
		const renderer = new YAPLRenderer({
			baseDir: "/test",
			whitespace: {
				trimBlocks: false,
				lstripBlocks: false,
				dedentBlocks: false,
			},
		});
		const template = `{% if status == "success" %}
Operation completed successfully!
All systems are running normally.
{% elseif status == "warning" %}
Warning: Some issues detected.
Please review the logs.
{% elseif status == "error" %}
Error: Operation failed!
Please contact support.
{% else %}
Status unknown.
{% endif %}`;

		const result1 = await renderer.renderString(template, {
			status: "success",
		});
		expect(result1.content).toContain("Operation completed successfully!");
		expect(result1.content).toContain("All systems are running normally.");

		const result2 = await renderer.renderString(template, {
			status: "warning",
		});
		expect(result2.content).toContain("Warning: Some issues detected.");
		expect(result2.content).toContain("Please review the logs.");

		const result3 = await renderer.renderString(template, { status: "error" });
		expect(result3.content).toContain("Error: Operation failed!");
		expect(result3.content).toContain("Please contact support.");

		const result4 = await renderer.renderString(template, {
			status: "unknown",
		});
		expect(result4.content).toContain("Status unknown.");
	});

	it("should handle elseif with whitespace control", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{%- if priority == "high" -%}
URGENT
{%- elseif priority == "medium" -%}
NORMAL
{%- elseif priority == "low" -%}
LOW
{%- else -%}
UNKNOWN
{%- endif -%}`;

		const result1 = await renderer.renderString(template, { priority: "high" });
		expect(result1.content).toBe("URGENT");

		const result2 = await renderer.renderString(template, {
			priority: "medium",
		});
		expect(result2.content).toBe("NORMAL");

		const result3 = await renderer.renderString(template, { priority: "low" });
		expect(result3.content).toBe("LOW");

		const result4 = await renderer.renderString(template, {
			priority: "unknown",
		});
		expect(result4.content).toBe("UNKNOWN");
	});

	it("should handle elseif with variable interpolation", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if user.subscription == "premium" %}Welcome {{ user.name }}, premium user!{% elseif user.subscription == "basic" %}Hello {{ user.name }}, basic user.{% else %}Hi {{ user.name }}, please upgrade.{% endif %}`;

		const result1 = await renderer.renderString(template, {
			user: { name: "Alice", subscription: "premium" },
		});
		expect(result1.content).toBe("Welcome Alice, premium user!");

		const result2 = await renderer.renderString(template, {
			user: { name: "Bob", subscription: "basic" },
		});
		expect(result2.content).toBe("Hello Bob, basic user.");

		const result3 = await renderer.renderString(template, {
			user: { name: "Charlie", subscription: "free" },
		});
		expect(result3.content).toBe("Hi Charlie, please upgrade.");
	});

	it("should handle single elseif without else", async () => {
		const renderer = new YAPLRenderer({ baseDir: "/test" });
		const template = `{% if temperature > 30 %}Hot{% elseif temperature < 10 %}Cold{% endif %}`;

		const result1 = await renderer.renderString(template, { temperature: 35 });
		expect(result1.content).toBe("Hot");

		const result2 = await renderer.renderString(template, { temperature: 5 });
		expect(result2.content).toBe("Cold");

		const result3 = await renderer.renderString(template, { temperature: 20 });
		expect(result3.content).toBe("");
	});
});
