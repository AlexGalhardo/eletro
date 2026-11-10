import { listPosts, listProductListPreviews } from "#lib/server/cms.ts";
import { getBundledListSources, getBundledPostSources } from "#lib/server/content.ts";
import { isPostDeployed } from "#lib/server/deploy.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const store = getStore();
	const [posts, lists] = await Promise.all([
		listPosts(store, getBundledPostSources()),
		listProductListPreviews(store, getBundledListSources()),
	]);
	const productsOf = new Map(lists.map((list) => [list.name, list.products]));
	return {
		posts: posts.map((post) => {
			const products = post.lists.flatMap((list) => productsOf.get(list) ?? []);
			return {
				...post,
				deployed: isPostDeployed(post.slug, post.sha),
				links: products.reduce((sum, product) => sum + product.links, 0),
				pending: products.reduce((sum, product) => sum + product.pending, 0),
			};
		}),
	};
}
