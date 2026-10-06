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
