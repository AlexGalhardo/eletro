import { writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import svelte from "@astrojs/svelte";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { publishJsonForPages } from "./src/lib/pages-output.ts";
import { frameworkAliases } from "./src/shims/aliases.ts";

export default defineConfig({
	site: "https://eletroradar.com.br",
	output: "static",
	// Directory indexes on disk. Canonical URLs add the slash GitHub Pages returns 200 for.
	// `never` keeps `astro preview` serving `/slug`. Pages 301s that bare path to `/slug/`.
	trailingSlash: "never",
	// The images and the verification files already live here.
	publicDir: "static",
	integrations: [
		svelte(),
		{
			name: "github-pages",
			hooks: {
				// Jekyll on GitHub Pages skips `_astro`. An empty .nojekyll turns that off.
				"astro:build:done": async ({ dir }) => {
					const out = fileURLToPath(dir);
					await writeFile(path.join(out, ".nojekyll"), "");
					await writeFile(path.join(out, "CNAME"), "eletroradar.com.br\n");
					await publishJsonForPages(path.join(out, "api"));
				},
			},
		},
	],
	vite: {
		plugins: [tailwindcss()],
		resolve: { alias: frameworkAliases },
	},
});
