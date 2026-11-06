import { listImages, listProductLists } from "#lib/server/cms.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const store = getStore();
	const [lists, covers] = await Promise.all([listProductLists(store), listImages(store, "covers")]);
	return { kind: store.kind, lists: lists.map((list) => list.name), covers };
}
