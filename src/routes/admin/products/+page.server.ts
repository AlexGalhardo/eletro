import { listProductLists } from "#lib/server/cms.ts";
import { isListDeployed } from "#lib/server/deploy.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const lists = await listProductLists(getStore());
	return { lists: lists.map((list) => ({ ...list, deployed: isListDeployed(list.name, list.sha) })) };
}
