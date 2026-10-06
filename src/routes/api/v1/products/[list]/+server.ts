import { json } from "@sveltejs/kit";
import { z } from "zod";
import { ApiError, parseBody, requireAdmin, respond } from "#lib/server/api.ts";
import { saveProductList } from "#lib/server/cms.ts";
import { getProductList } from "#lib/server/content.ts";
import { getStore } from "#lib/server/store/index.ts";

const updateSchema = z.object({ sha: z.string().min(1), products: z.unknown() });

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
