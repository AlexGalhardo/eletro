import { z } from "zod";
import { slugSchema } from "#lib/content/schema.ts";
import { parseBody, requireAdmin, respond } from "#lib/server/api.ts";
import { saveProductList } from "#lib/server/cms.ts";
import { getProductListNames } from "#lib/server/content.ts";
import { json } from "#lib/server/http.ts";
import { getStore } from "#lib/server/store/index.ts";

// The products are validated by the CMS service, which answers with messages meant for the editor.
const createSchema = z.object({ name: slugSchema, products: z.unknown() });

/** Names of the product lists published with this deploy. */
export function GET() {
	return json({ data: getProductListNames() });
}

export function POST({ request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { name, products } = await parseBody(createSchema, request);

		return json({ data: await saveProductList(getStore(), name, products, author) }, { status: 201 });
	});
}
