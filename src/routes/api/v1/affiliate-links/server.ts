import { z } from "zod";
import { catalogueToCsv } from "#lib/affiliate-links.ts";
import { parseQuery, requireAdmin, respond } from "#lib/server/api.ts";
import { getAffiliateCatalogue } from "#lib/server/content.ts";
import { site } from "#lib/site.config.ts";

const querySchema = z.object({ format: z.enum(["json", "csv"]).default("json") });

/**
 * Every affiliate link the deployed site shows, as a file the links dashboard can import. The body is the
 * dashboard's own format (a bare array or a CSV), not the `{ data }` envelope of the other endpoints.
 */
export function GET({ url, locals }) {
	return respond(() => {
		requireAdmin(locals);
		const { format } = parseQuery(querySchema, url);
		const catalogue = getAffiliateCatalogue();
		const body = format === "csv" ? catalogueToCsv(catalogue) : JSON.stringify(catalogue, null, "\t");
		return new Response(body, {
			headers: {
				"content-type":
					format === "csv" ? "text/csv; charset=utf-8" : "application/json; charset=utf-8",
				"content-disposition": `attachment; filename="${site.domain}-affiliate-links.${format}"`,
			},
		});
	});
}
