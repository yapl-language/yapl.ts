/// <reference types="vitest" />
import { defineConfig } from "vite";
import dts from "vite-plugin-dts";

export default defineConfig({
	build: {
		lib: {
			entry: {
				index: "./src/index.ts",
				node: "./src/node.ts"
			},
			name: "YAPL",
			formats: ["es", "cjs"],
		},
		sourcemap: true,
		target: "es2020",
		rollupOptions: {
			// Mark external dependencies here, e.g. ["react"]
			external: ["node:fs", "node:path"],
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
