import { json } from "@sveltejs/kit";
import { absoluteUrl } from "#lib/seo/jsonld.ts";
import { ApiError, requireAdmin, respond } from "#lib/server/api.ts";
import { GoogleError, googleCredentials, submitSitemap } from "#lib/server/google.ts";
import {
	GOOGLE_SEARCH_CONSOLE_SITE,
	GOOGLE_SERVICE_ACCOUNT_EMAIL,
	GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
} from "$app/env/private";

/** Resubmits the sitemap to Search Console, which asks Google to read it again. */
export function POST({ locals }) {
	return respond(async () => {
		requireAdmin(locals);
		const credentials = googleCredentials(
			GOOGLE_SERVICE_ACCOUNT_EMAIL,
			GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
		);
		if (!credentials || !GOOGLE_SEARCH_CONSOLE_SITE)
			throw new ApiError(503, "google_not_configured", "Google Search Console is not configured", [
				"Faltam as variáveis do Google Search Console neste servidor.",
			]);

		const sitemap = absoluteUrl("/sitemap.xml");
		try {
			await submitSitemap(credentials, GOOGLE_SEARCH_CONSOLE_SITE, sitemap);
		} catch (error) {
			if (error instanceof GoogleError)
				throw new ApiError(502, "google_failed", "Google refused the request", [error.message]);
			throw error;
		}
		return json({ data: { sitemap } });
	});
}
