import { error } from "@sveltejs/kit";
import { getProductList, listImages, ValidationError } from "#lib/server/cms.ts";
import { isListDeployed } from "#lib/server/deploy.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load({ params }) {
	const store = getStore();
	const [list, images] = await Promise.all([
		getProductList(store, params.list).catch((cause: unknown) => {
			if (cause instanceof ValidationError) error(404, "Lista não encontrada");
			throw cause;
		}),
		listImages(store, "posts"),
	]);
	if (!list) error(404, "Lista não encontrada");

	return { kind: store.kind, ...list, deployed: isListDeployed(list.name, list.sha), images };
}
