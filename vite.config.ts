/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: "./src/index.ts",
			name: "YAPL",
			formats: ["es", "cjs"],
			fileName: (format) => (format === "es" ? "index.mjs" : "index.cjs"),
		},
		sourcemap: true,
		target: "es2020",
		rollupOptions: {
			// Mark external dependencies here, e.g. ["react"]
			external: [],
		},
	},
	test: {
		coverage: { reporter: ["text", "html"] },
	},
	plugins: [
		dts({
			rollupTypes: true,
			outDir: "dist",
		}),
	],
});
