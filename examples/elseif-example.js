import { YAPL } from "../dist/index.mjs";

// Create a YAPL instance
const yapl = new YAPL({ baseDir: "." });

// Example 1: Grade calculation with elseif
async function gradeExample() {
	console.log("=== Grade Calculation Example ===");
	const template = `{% if score >= 90 %}Grade: A (Excellent!){% elseif score >= 80 %}Grade: B (Good work!){% elseif score >= 70 %}Grade: C (Satisfactory){% elseif score >= 60 %}Grade: D (Needs improvement){% else %}Grade: F (Please retry){% endif %}`;

	const scores = [95, 85, 75, 65, 45];

	for (const score of scores) {
		const result = await yapl.renderString(template, { score });
		console.log(`Score ${score}: ${result.content}`);
	}
}

// Example 2: User access levels
async function accessLevelExample() {
	console.log("\n=== Access Level Example ===");
	const template = `{% if user.role == "admin" %}🔑 Full system access{% elseif user.role == "moderator" %}🛡️ Moderation tools available{% elseif user.role == "premium" %}⭐ Premium features unlocked{% elseif user.role == "user" %}👤 Standard user access{% else %}🚫 Limited access{% endif %}`;

	const users = [
		{ role: "admin" },
		{ role: "moderator" },
		{ role: "premium" },
		{ role: "user" },
		{ role: "guest" },
	];

	for (const user of users) {
		const result = await yapl.renderString(template, { user });
		console.log(`${user.role}: ${result.content}`);
	}
}

// Example 3: Age-based content
async function ageBasedExample() {
	console.log("\n=== Age-Based Content Example ===");
	const template = `{% if age >= 65 %}Senior citizen benefits available{% elseif age >= 18 %}Adult content and services{% elseif age >= 13 %}Teen-appropriate content{% else %}Child-safe content only{% endif %}`;

	const ages = [70, 25, 16, 8];

	for (const age of ages) {
		const result = await yapl.renderString(template, { age });
		console.log(`Age ${age}: ${result.content}`);
	}
}

// Example 4: Complex conditions with logical operators
async function complexConditionsExample() {
	console.log("\n=== Complex Conditions Example ===");
	const template = `{% if user.active and user.verified %}✅ Verified active user{% elseif user.active and user.verified == false %}⚠️ Active but unverified{% elseif user.active == false and user.verified %}💤 Verified but inactive{% else %}❌ Inactive and unverified{% endif %}`;

	const users = [
		{ active: true, verified: true },
		{ active: true, verified: false },
		{ active: false, verified: true },
		{ active: false, verified: false },
	];

	for (const user of users) {
		const result = await yapl.renderString(template, { user });
		console.log(
			`Active: ${user.active}, Verified: ${user.verified} → ${result.content}`,
		);
	}
}

// Example 5: Temperature-based recommendations
async function temperatureExample() {
	console.log("\n=== Temperature-Based Recommendations ===");
	const template = `{% if temperature > 30 %}🔥 It's hot! Stay hydrated and seek shade.{% elseif temperature > 20 %}☀️ Perfect weather for outdoor activities.{% elseif temperature > 10 %}🧥 A bit cool, consider a light jacket.{% elseif temperature > 0 %}🥶 Cold weather, dress warmly.{% else %}❄️ Freezing! Bundle up and stay safe.{% endif %}`;

	const temperatures = [35, 25, 15, 5, -5];

	for (const temperature of temperatures) {
		const result = await yapl.renderString(template, { temperature });
		console.log(`${temperature}°C: ${result.content}`);
	}
}

// Run all examples
async function runExamples() {
	try {
		await gradeExample();
		await accessLevelExample();
		await ageBasedExample();
		await complexConditionsExample();
		await temperatureExample();
	} catch (error) {
		console.error("Error:", error.message);
	}
}

runExamples();
