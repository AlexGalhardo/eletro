import { referencedLists } from "#lib/content/parse.ts";
import type { Product } from "#lib/content/schema.ts";
import { coverWidths, getPost, getPosts, getProductList } from "#lib/server/content.ts";
import { error } from "#lib/server/http.ts";

// The home page only links the first few posts, so every slug is listed for the prerenderer.
export const entries = (): { slug: string }[] => getPosts().map((post) => ({ slug: post.slug }));

export function load({ params }: { params: { slug: string } }) {
	const entry = getPost(params.slug);
	if (!entry) error(404, "Postagem não encontrada");

	const productLists: Record<string, Product[]> = {};
	for (const list of referencedLists(entry.body)) {
		const products = getProductList(list);
		if (products) productLists[list] = products;
	}

	return { post: entry.post, coverWidths: coverWidths(entry.post.cover), productLists };
}
