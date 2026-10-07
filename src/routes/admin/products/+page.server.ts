import { listPosts, listProductLists, listUsage } from "#lib/server/cms.ts";
import { getBundledPostSources } from "#lib/server/content.ts";
import { isListDeployed } from "#lib/server/deploy.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const store = getStore();
	const [lists, posts] = await Promise.all([
		listProductLists(store),
		listPosts(store, getBundledPostSources()),
	]);
	const usage = listUsage(posts);
	return {
		lists: lists.map((list) => ({
			...list,
			deployed: isListDeployed(list.name, list.sha),
			usedBy: usage.get(list.name) ?? [],
		})),
	};
}
