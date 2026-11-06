import { listImages } from "#lib/server/cms.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const store = getStore();
	return { kind: store.kind, images: await listImages(store, "posts") };
}
