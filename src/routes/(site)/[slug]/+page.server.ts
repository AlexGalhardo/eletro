import { error } from "@sveltejs/kit";
import { referencedLists } from "#lib/content/parse.ts";
import type { Product } from "#lib/content/schema.ts";
import { getPost, getPosts, getProductList } from "#lib/server/content.ts";
import type { EntryGenerator } from "./$types";

// The home page only links the first few posts, so every slug is listed for the prerenderer.
export const entries: EntryGenerator = () => getPosts().map((post) => ({ slug: post.slug }));

export function load({ params }) {
	const entry = getPost(params.slug);
	if (!entry) error(404, "Postagem não encontrada");

	const productLists: Record<string, Product[]> = {};
	for (const list of referencedLists(entry.body)) {
		const products = getProductList(list);
		if (products) productLists[list] = products;
	}

	return { post: entry.post, productLists };
}
