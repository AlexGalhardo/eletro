import adapter from "@sveltejs/adapter-vercel";
import { sveltekit } from "@sveltejs/kit/vite";
import tailwindcss from "@tailwindcss/vite";
import { mdsvex } from "mdsvex";
import { defineConfig } from "vitest/config";
import { coverVariants } from "./scripts/cover-variants.ts";
import { injectContentComponents } from "./src/lib/content/mdx-preprocess.ts";

export default defineConfig({
	plugins: [
		coverVariants(),
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Runes everywhere except dependencies and mdsvex output (which still emits legacy syntax).
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes("node_modules") || filename.endsWith(".mdx")
						? undefined
						: true,
			},
			// The adapter writes symlinks, which Windows refuses without Developer Mode. Only the Vercel
			// build needs its output: `vite preview` and the e2e tests run from `.svelte-kit/output`.
			adapter: process.env.VERCEL ? adapter() : undefined,
			// Order matters: components are injected into the raw Markdown before mdsvex compiles it.
			preprocess: [injectContentComponents(), mdsvex({ extensions: [".mdx"], smartypants: false })],
			extensions: [".svelte", ".mdx"],
		}),
	],
	test: {
		environment: "node",
		include: [
			"src/**/*.test.ts",
			"webscrapping/**/*.test.ts",
			"tests/unit/**/*.test.ts",
			"tests/integration/**/*.test.ts",
		],
	},
});
