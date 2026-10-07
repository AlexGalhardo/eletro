import { json } from "@sveltejs/kit";
import { z } from "zod";
import { ApiError, parseBody, parseQuery, requireAdmin, respond } from "#lib/server/api.ts";
import { deleteProductList, saveProductList } from "#lib/server/cms.ts";
import { getProductList } from "#lib/server/content.ts";
import { getStore } from "#lib/server/store/index.ts";

const versionSchema = z.object({ sha: z.string().min(1) });
const updateSchema = z.object({ ...versionSchema.shape, products: z.unknown() });

export function GET({ params }) {
	return respond(() => {
		const products = getProductList(params.list);
		if (!products) throw new ApiError(404, "not_found", `Product list "${params.list}" not found`);

		return json({ data: { name: params.list, products } });
	});
}

/** Replaces the version identified by `sha`. A stale or unknown `sha` answers 409 instead of overwriting. */
export function PUT({ params, request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { sha, products } = await parseBody(updateSchema, request);

		return json({ data: await saveProductList(getStore(), params.list, products, author, sha) });
	});
}

/** Deletes the list. Refused (400) while a post shows it, since the build would fail without it. */
export function DELETE({ params, url, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { sha } = parseQuery(versionSchema, url);

		await deleteProductList(getStore(), params.list, author, sha);
		return new Response(null, { status: 204 });
	});
}
