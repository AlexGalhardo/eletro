import { readdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import react from "@astrojs/react";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "astro/config";
import { aliases } from "./src/aliases.ts";
import { sealAdminHtml } from "./src/lib/admin/csp.ts";
import { publishJsonForPages } from "./src/lib/pages-output.ts";

export default defineConfig({
	site: process.env.SITE_URL ?? "http://localhost:4321",
	output: "static",
	// Directory indexes on disk. Canonical URLs add the slash GitHub Pages returns 200 for.
	// `never` keeps `astro preview` serving `/slug`. Pages 301s that bare path to `/slug/`.
	trailingSlash: "never",
	// The images and the verification files already live here.
	publicDir: "static",
	integrations: [
		react(),
		{
			name: "github-pages",
			hooks: {
				// Jekyll on GitHub Pages skips `_astro`. An empty .nojekyll turns that off.
				"astro:build:done": async ({ dir }) => {
					const out = fileURLToPath(dir);
					await writeFile(path.join(out, ".nojekyll"), "");
					await publishJsonForPages(path.join(out, "api"));
					const adminDir = path.join(out, "admin");
					for (const entry of await readdir(adminDir, { recursive: true })) {
						if (!entry.endsWith(".html")) continue;
						const file = path.join(adminDir, entry);
						await writeFile(file, sealAdminHtml(await readFile(file, "utf8")));
					}
				},
			},
		},
	],
	vite: {
		plugins: [tailwindcss()],
		resolve: { alias: aliases },
	},
});
