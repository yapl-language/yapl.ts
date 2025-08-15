const { YAPL } = require("../dist/index.js");

// Create a YAPL instance
const yapl = new YAPL({ baseDir: "." });

// Example 1: Simple array iteration
async function simpleArrayExample() {
	console.log("=== Simple Array Example ===");
	const template = `{% for item in items %}{{ item }} {% endfor %}`;
	const vars = { items: ["apple", "banana", "cherry"] };

	const result = await yapl.renderString(template, vars);
	console.log("Result:", result.content);
	// Output: apple banana cherry
}

// Example 2: Object array iteration (like the user's request)
async function objectArrayExample() {
	console.log("\n=== Object Array Example ===");
	const template = `{% for technique in study_techniques %}- **{{ technique.name }}**: {{ technique.description }}{% endfor %}`;
	const vars = {
		study_techniques: [
			{ name: "Pomodoro", description: "25-minute focused work sessions" },
			{
				name: "Spaced Repetition",
				description: "Review material at increasing intervals",
			},
			{
				name: "Active Recall",
				description: "Test yourself instead of re-reading",
			},
		],
	};

	const result = await yapl.renderString(template, vars);
	console.log("Result:", result.content);
}

// Example 3: Nested for loops
async function nestedLoopExample() {
	console.log("\n=== Nested Loop Example ===");
	const template = `{% for category in categories %}## {{ category.name }}
{% for item in category.items %}- {{ item }}
{% endfor %}{% endfor %}`;
	const vars = {
		categories: [
			{ name: "Fruits", items: ["apple", "banana"] },
			{ name: "Vegetables", items: ["carrot", "broccoli"] },
		],
	};

	const result = await yapl.renderString(template, vars);
	console.log("Result:", result.content);
}

// Example 4: Array literals
async function arrayLiteralExample() {
	console.log("\n=== Array Literal Example ===");
	const template = `{% for num in [1, 2, 3, 4, 5] %}{{ num }}{% if num < 5 %}, {% endif %}{% endfor %}`;
	const vars = {};

	const result = await yapl.renderString(template, vars);
	console.log("Result:", result.content);
}

// Run all examples
async function runExamples() {
	try {
		await simpleArrayExample();
		await objectArrayExample();
		await nestedLoopExample();
		await arrayLiteralExample();
	} catch (error) {
		console.error("Error:", error.message);
	}
}

runExamples();
