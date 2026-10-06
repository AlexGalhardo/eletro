import { json, redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { fail, rateLimit } from "#lib/server/api.ts";
import { getAdmin, getAuth } from "#lib/server/auth.ts";
import { site } from "#lib/site.config.ts";
import { building } from "$app/env";

const PRIVATE_PREFIXES = ["/admin", "/api"];
const LOGIN = "/admin/login";
const API = "/api/v1";
/** Writes (content, uploads, contact form) accepted from one address per minute. */
const WRITES_PER_MINUTE = 60;

const isUnder = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(`${prefix}/`);

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	event.locals.admin = null;

	// Sessions are only looked up where they matter, so public pages never touch the database.
	const needsSession = isUnder(pathname, "/admin") || isUnder(pathname, "/api");
	if (needsSession && !building) {
		if (isUnder(pathname, API) && event.request.method !== "GET") {
			const wait = rateLimit(clientAddress(event), WRITES_PER_MINUTE, 60_000);
			if (wait > 0) {
				const response = fail(429, "rate_limited", "Too many requests. Try again shortly.");
				response.headers.set("Retry-After", String(wait));
				return withNoIndex(response);
			}
		}

		if (isUnder(pathname, "/api/auth")) {
			const auth = await getAuth();
			if (!auth)
				return json(
					{ error: { code: "auth_not_configured", message: "Admin is not configured" } },
					{ status: 503 },
				);
			return withNoIndex(await auth.handler(event.request));
		}

		event.locals.admin = await getAdmin(event.request.headers);

		if (isUnder(pathname, "/admin")) {
			if (!event.locals.admin && pathname !== LOGIN) redirect(303, LOGIN);
			if (event.locals.admin && pathname === LOGIN) redirect(303, "/admin");
		}
	}

	const response = await resolve(event, {
		transformPageChunk: ({ html }) => html.replace("%lang%", site.locale),
	});

	// Reading the API from another origin is allowed; it only exposes what the site already publishes.
	if (isUnder(pathname, API) && event.request.method === "GET")
		response.headers.set("Access-Control-Allow-Origin", "*");

	return PRIVATE_PREFIXES.some((prefix) => isUnder(pathname, prefix)) ? withNoIndex(response) : response;
};

function clientAddress(event: { getClientAddress: () => string }): string {
	try {
		return event.getClientAddress();
	} catch {
		// Some adapters cannot tell the address; those requests share one bucket.
		return "unknown";
	}
}

// Belt and braces with robots.txt: private areas must never be indexed, even if linked from elsewhere.
function withNoIndex(response: Response): Response {
	response.headers.set("X-Robots-Tag", "noindex, nofollow");
	return response;
}
