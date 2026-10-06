import adapter from "@sveltejs/adapter-auto";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { mdsvex } from "mdsvex";
import { defineConfig } from "vitest/config";
import { injectContentComponents } from "./src/lib/content/mdx-preprocess.ts";

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Runes everywhere except dependencies and mdsvex output (which still emits legacy syntax).
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") || filename.endsWith(".mdx")
						? undefined
						: true,
			},
			adapter: adapter(),
			// Order matters: components are injected into the raw Markdown before mdsvex compiles it.
			preprocess: [injectContentComponents(), mdsvex({ extensions: [".mdx"], smartypants: false })],
			extensions: [".svelte", ".mdx"],
		}),
	],
	test: {
		environment: "node",
		include: ["src/**/*.test.ts", "tests/unit/**/*.test.ts", "tests/integration/**/*.test.ts"],
	},
});
