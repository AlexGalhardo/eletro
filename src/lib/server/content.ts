import { coverWidths as widthsOf } from "../content/cover.ts";
import { isPublished, parsePost } from "../content/parse.ts";
import { type Post, type Product, productListSchema } from "../content/schema.ts";

// Content is bundled at build time, so the public site needs no filesystem or network access.
const postFiles = import.meta.glob<string>("/content/posts/*.mdx", {
	eager: true,
	query: "?raw",
	import: "default",
});
const productFiles = import.meta.glob<unknown>("/content/products/*.json", {
	eager: true,
	import: "default",
});

// Only the keys are used: they tell which resized covers the build produced (none in development).
const coverCopies = new Set(
	Object.keys(import.meta.glob("/static/images/covers/w*/*.webp")).map((file) =>
		file.slice("/static".length),
	),
);

/** Widths of the resized copies of a cover. Sent to the page instead of the URLs, which it can rebuild. */
export const coverWidths = (cover: string): number[] => widthsOf(cover, (url) => coverCopies.has(url));

const nameOf = (path: string) => path.slice(path.lastIndexOf("/") + 1).replace(/\.(mdx|json)$/, "");

const parsed = Object.entries(postFiles)
	.map(([path, raw]) => parsePost(nameOf(path), raw))
	.sort((a, b) => (a.post.date < b.post.date ? 1 : -1));

const productLists = new Map<string, Product[]>(
	Object.entries(productFiles).map(([path, data]) => [nameOf(path), productListSchema.parse(data)]),
);

/** Published posts, newest first. */
export function getPosts(): Post[] {
	return parsed.map((entry) => entry.post).filter((post) => isPublished(post));
}

export function getPost(slug: string): { post: Post; body: string } | undefined {
	const entry = parsed.find((candidate) => candidate.post.slug === slug);
	return entry && isPublished(entry.post) ? entry : undefined;
}

export function getProductList(list: string): Product[] | undefined {
	return productLists.get(list);
}

export function getProductListNames(): string[] {
	return [...productLists.keys()].sort();
}

/** Raw text of every bundled post (drafts and scheduled included), keyed by slug. Used by the admin. */
export function getBundledPostSources(): Map<string, string> {
	return new Map(Object.entries(postFiles).map(([path, raw]) => [nameOf(path), raw]));
}

const productSources = import.meta.glob<string>("/content/products/*.json", {
	eager: true,
	query: "?raw",
	import: "default",
});

/** Raw text of every bundled product list, keyed by name. Used by the admin to tell what is already deployed. */
export function getBundledListSources(): Map<string, string> {
	return new Map(Object.entries(productSources).map(([path, raw]) => [nameOf(path), raw]));
}
