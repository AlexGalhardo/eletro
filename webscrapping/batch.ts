/**
 * Imports, as drafts, every source post that this site does not have yet.
 *
 *   bun webscrapping/batch.ts            lists the missing URLs, writes nothing
 *   bun webscrapping/batch.ts --write    imports them one by one with the local store
 *   bun webscrapping/batch.ts --write --limit 5
 *
 * "Missing" means no post in content/posts has the URL in `ref`. Each import is the same as
 * `bun webscrapping/cli.ts <url> --write`, without the Mistral rewrite: the drafts keep the template
 * texts, built only from product names and specs, and are rewritten afterwards.
 * Requests run in sequence with a pause, so the source site sees one slow reader.
 * The report (imported, skipped and why) goes to .data/batch-import.json.
 */
import { mkdir, readdir, readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { setTimeout } from "node:timers/promises";
import matter from "gray-matter";
import { importPost } from "../src/lib/server/post-import.ts";
import { createLocalStore } from "../src/lib/server/store/local.ts";
import { site } from "../src/lib/site.config.ts";
import { fetchLimited } from "./fetch.ts";

const PAUSE_MS = 1500;
const SITEMAP_INDEX = "https://eletrosinter.com.br/sitemap_index.xml";

/** Same page with or without the trailing slash, `www` or letter case. */
export function normalizeUrl(url: string): string {
	return url.trim().toLowerCase().replace("://www.", "://").replace(/\/+$/, "");
}

export function locsOf(xml: string): string[] {
	return [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((match) => match[1] as string);
}

/** The `ref` of a post file, read as YAML: it may be quoted either way or folded over two lines. */
export function refOf(raw: string): string | undefined {
	const ref: unknown = matter(raw).data.ref;
	return typeof ref === "string" ? ref : undefined;
}

async function fetchText(url: string): Promise<string> {
	const bytes = await fetchLimited(url, {
		allowedHosts: site.postImport.sourceHosts,
		maxBytes: 3 * 1024 * 1024,
	});
	return new TextDecoder().decode(bytes);
}

async function sourcePostUrls(): Promise<string[]> {
	const sitemaps = locsOf(await fetchText(SITEMAP_INDEX)).filter((url) =>
		/\/post-sitemap\d*\.xml$/.test(url),
	);
	const urls: string[] = [];
	for (const sitemap of sitemaps) urls.push(...locsOf(await fetchText(sitemap)));
	// Posts live at /<section>/[<subsection>/]<slug>/; the sitemap also lists the home and /produto/ pages.
	return urls.filter((url) => {
		const segments = new URL(url).pathname.split("/").filter(Boolean);
		return segments.length >= 2 && segments[0] !== "produto";
	});
}

async function existingRefs(root: string): Promise<Set<string>> {
	const folder = join(root, "content", "posts");
	const refs = new Set<string>();
	for (const file of await readdir(folder)) {
		const ref = refOf(await readFile(join(folder, file), "utf8"));
		if (ref) refs.add(normalizeUrl(ref));
	}
	return refs;
}

if (import.meta.main) {
	const args = process.argv.slice(2);
	const write = args.includes("--write");
	const limitArg = args.indexOf("--limit");
	const limit = limitArg >= 0 ? Number(args[limitArg + 1]) : Number.POSITIVE_INFINITY;
	const root = process.cwd();

	const refs = await existingRefs(root);
	const missing = (await sourcePostUrls()).filter((url) => !refs.has(normalizeUrl(url)));
	console.error(`${missing.length} source posts missing (${refs.size} already here).`);
	if (!write) {
		console.log(missing.join("\n"));
		process.exit(0);
	}

	const store = createLocalStore(root);
	const author = { name: "Batch import", email: site.contactEmail };
	const imported: Array<{ url: string; slug: string; products: number; warnings: string[] }> = [];
	const skipped: Array<{ url: string; reason: string }> = [];
	for (const url of missing.slice(0, limit)) {
		try {
			const result = await importPost(store, url, author);
			// The rewrite warning is expected here: texts are rewritten in a later step.
			const warnings = result.warnings.filter((warning) => !warning.startsWith("MISTRAL_API_KEY"));
			imported.push({ url, slug: result.slug, products: result.products, warnings });
			console.error(`ok   ${result.slug} (${result.products})`);
		} catch (error) {
			// A page that cannot become a draft (no products, unknown category, slug taken) is logged, not fatal.
			if (!(error instanceof Error)) throw error;
			const reason = error.message;
			skipped.push({ url, reason });
			console.error(`skip ${url}: ${reason}`);
		}
		await setTimeout(PAUSE_MS);
	}

	await mkdir(join(root, ".data"), { recursive: true });
	await writeFile(
		join(root, ".data", "batch-import.json"),
		JSON.stringify({ imported, skipped }, null, "\t"),
	);
	console.error(`Imported ${imported.length}, skipped ${skipped.length}. Report: .data/batch-import.json`);
}
