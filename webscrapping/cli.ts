/**
 * Runs the import by hand, outside the dashboard.
 *
 *   bun webscrapping/cli.ts <url>          prints the scraped data and the draft, writes nothing
 *   bun webscrapping/cli.ts <url> --write  stores images, product list and draft in this working copy
 *
 * Not part of the build. `--write` uses the same service as `POST /api/v1/imports`, with the local store.
 */
import { importPost } from "../src/lib/server/post-import.ts";
import { createLocalStore } from "../src/lib/server/store/local.ts";
import { site } from "../src/lib/site.config.ts";
import { buildDraft } from "./build.ts";
import { fetchLimited } from "./fetch.ts";
import { parsePostHtml } from "./parse.ts";

const [url, flag] = process.argv.slice(2);
if (!url) {
	console.error("Usage: bun webscrapping/cli.ts <url> [--write]");
	process.exit(1);
}

const started = performance.now();
try {
	if (flag === "--write") {
		const author = { name: "Import CLI", email: site.contactEmail };
		console.log(await importPost(createLocalStore(process.cwd()), url, author));
	} else {
		const bytes = await fetchLimited(url, {
			allowedHosts: site.postImport.sourceHosts,
			maxBytes: 3 * 1024 * 1024,
		});
		const scraped = parsePostHtml(new TextDecoder().decode(bytes), url);
		const draft = buildDraft(scraped, {
			categories: site.categories.map((category) => category.id),
			date: new Date().toISOString().slice(0, 10),
			maxProducts: site.postImport.maxProducts,
		});
		console.log(JSON.stringify({ scraped, draft }, null, 2));
	}
	console.error(`Done in ${((performance.now() - started) / 1000).toFixed(1)}s`);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
