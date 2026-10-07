/**
 * Runs the import by hand, outside the dashboard.
 *
 *   bun webscrapping/cli.ts <url>          prints the scraped data and the draft, writes nothing
 *   bun webscrapping/cli.ts <url> --write  stores images, product list and draft in this working copy
 *
 * With MISTRAL_API_KEY in the environment (Bun reads `.env`), both modes rewrite the summary and FAQ.
 *
 * Not part of the build. `--write` uses the same service as `POST /api/v1/imports`, with the local store.
 */
import { importPost } from "../src/lib/server/post-import.ts";
import { createLocalStore } from "../src/lib/server/store/local.ts";
import { site } from "../src/lib/site.config.ts";
import { buildDraft, topicOf } from "./build.ts";
import { fetchLimited } from "./fetch.ts";
import { parsePostHtml } from "./parse.ts";
import { rewriteTexts } from "./rewrite.ts";

const [url, flag] = process.argv.slice(2);
if (!url) {
	console.error("Usage: bun webscrapping/cli.ts <url> [--write]");
	process.exit(1);
}

const apiKey = process.env.MISTRAL_API_KEY?.trim() || undefined;
const started = performance.now();
try {
	if (flag === "--write") {
		const author = { name: "Import CLI", email: site.contactEmail };
		console.log(await importPost(createLocalStore(process.cwd()), url, author, new Date(), apiKey));
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
			rewritten: apiKey ? await rewriteTexts(scraped, topicOf(scraped), apiKey) : null,
		});
		console.log(JSON.stringify({ scraped, draft }, null, 2));
	}
	console.error(`Done in ${((performance.now() - started) / 1000).toFixed(1)}s`);
} catch (error) {
	console.error(error instanceof Error ? error.message : error);
	process.exit(1);
}
