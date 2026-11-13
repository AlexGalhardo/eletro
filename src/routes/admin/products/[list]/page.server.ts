import { getProductList, listImages, listPosts, listUsage, ValidationError } from "#lib/server/cms.ts";
import { getBundledPostSources } from "#lib/server/content.ts";
import { isListDeployed } from "#lib/server/deploy.ts";
import { error } from "#lib/server/http.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load({ params }) {
	const store = getStore();
	const [list, images, posts] = await Promise.all([
		getProductList(store, params.list).catch((cause: unknown) => {
			if (cause instanceof ValidationError) error(404, "Lista não encontrada");
			throw cause;
		}),
		listImages(store, "posts"),
		listPosts(store, getBundledPostSources()),
	]);
	if (!list) error(404, "Lista não encontrada");

	return {
		kind: store.kind,
		...list,
		deployed: isListDeployed(list.name, list.sha),
		images,
		usedBy: listUsage(posts).get(list.name) ?? [],
	};
}
