import type { Handle } from "@sveltejs/kit/hooks";
import { site } from "#lib/site.config.ts";

const PRIVATE_PREFIXES = ["/admin", "/api"];

export const handle: Handle = async ({ event, resolve }) => {
	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace("%lang%", site.locale),
	});

	// Belt and braces with robots.txt: private areas must never be indexed, even if linked from elsewhere.
	if (PRIVATE_PREFIXES.some((prefix) => event.url.pathname.startsWith(prefix))) {
		response.headers.set("X-Robots-Tag", "noindex, nofollow");
	}

	return response;
};
