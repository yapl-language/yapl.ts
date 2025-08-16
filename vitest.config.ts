import { defineConfig } from "vitest/config";

export default defineConfig({
	test: {
		environment: "node",
		globals: true,
		coverage: {
			reporter: ["text", "html", "lcov"],
			exclude: [
				"examples/**",
				"dist/**",
				"**/*.d.ts",
				"vite.config.ts",
				"vitest.config.ts",
				"node_modules/**",
			],
		},
	},
});
