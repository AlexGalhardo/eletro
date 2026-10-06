import { existsSync, readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { parsePost, referencedLists } from "../../src/lib/content/parse.ts";
import { productListSchema, SLUG_PATTERN } from "../../src/lib/content/schema.ts";

// Validates the real content of the repository, so a broken post or product never reaches a deploy.
const root = path.resolve(import.meta.dirname, "../..");
const postsDir = path.join(root, "content/posts");
const productsDir = path.join(root, "content/products");

const posts = readdirSync(postsDir)
	.filter((file) => file.endsWith(".mdx"))
	.map((file) => {
		const slug = file.replace(/\.mdx$/, "");
		return { slug, ...parsePost(slug, readFileSync(path.join(postsDir, file), "utf8")) };
	});

const productLists = new Map(
	readdirSync(productsDir)
		.filter((file) => file.endsWith(".json"))
		.map((file) => [
			file.replace(/\.json$/, ""),
			JSON.parse(readFileSync(path.join(productsDir, file), "utf8")),
		]),
);

const isLocal = (url: string) => url.startsWith("/");
const inStatic = (url: string) => existsSync(path.join(root, "static", url));

describe("posts", () => {
	it("has content to publish", () => {
		expect(posts.length).toBeGreaterThanOrEqual(64);
	});

	it.each(posts)(
		"$slug has a valid slug, a cover that exists and no Svelte expressions",
		({ slug, post, body }) => {
			expect(slug).toMatch(SLUG_PATTERN);
			if (isLocal(post.cover)) expect(inStatic(post.cover), `cover ${post.cover}`).toBe(true);
			// mdsvex would evaluate anything inside braces as code.
			expect(body).not.toMatch(/[{}]/);
		},
	);

	it.each(posts)("$slug only references product lists that exist", ({ body }) => {
		for (const list of referencedLists(body)) expect(productLists.has(list), `list ${list}`).toBe(true);
	});
});

describe("product lists", () => {
	it.each([...productLists.keys()])("%s matches the schema and its images exist", (name) => {
		const products = productListSchema.parse(productLists.get(name));

		expect(products.length).toBeGreaterThan(0);
		expect(new Set(products.map((product) => product.id)).size, "duplicated product id").toBe(
			products.length,
		);
		for (const product of products) {
			if (isLocal(product.image)) expect(inStatic(product.image), `image ${product.image}`).toBe(true);
		}
	});
});
