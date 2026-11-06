import type { APIRoute } from "astro";
import { getProductListNames } from "#lib/server/content.ts";
import { GET as handler } from "../../../../routes/api/v1/products/[list]/server.ts";

export function getStaticPaths() {
	return getProductListNames().map((list) => ({ params: { list } }));
}

export const GET: APIRoute = ({ params }) => handler({ params: { list: params.list ?? "" } });
