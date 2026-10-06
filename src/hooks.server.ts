import { json, redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { fail, rateLimit } from "#lib/server/api.ts";
import { getAdmin, getAuth } from "#lib/server/auth.ts";
import { site } from "#lib/site.config.ts";
import { building } from "$app/env";

const PRIVATE_PREFIXES = ["/admin", "/api"];
const LOGIN = "/admin/login";
const API = "/api/v1";
/** Writes (content, uploads, forms, sign-in attempts) accepted from one address per minute. */
const WRITES_PER_MINUTE = 60;
/** Changes state although it is a GET (schedulers can only call with GET), so it is limited like a write. */
const DISPATCH_RUN = `${API}/newsletter/dispatches/run`;

const isUnder = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(`${prefix}/`);

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	event.locals.admin = null;

	// Sessions are only looked up where they matter, so public pages never touch the database.
	const needsSession = isUnder(pathname, "/admin") || isUnder(pathname, "/api");
	if (needsSession && !building) {
		// Every write under /api, test login and auth included: guessing a token must not be free.
		if (isUnder(pathname, "/api") && (event.request.method !== "GET" || pathname === DISPATCH_RUN)) {
			const wait = rateLimit(clientAddress(event), WRITES_PER_MINUTE, 60_000);
			if (wait > 0) {
				const response = fail(429, "rate_limited", "Too many requests. Try again shortly.");
				response.headers.set("Retry-After", String(wait));
				return secure(response, true);
			}
		}

		if (isUnder(pathname, "/api/auth")) {
			const auth = await getAuth();
			if (!auth)
				return secure(
					json(
						{ error: { code: "auth_not_configured", message: "Admin is not configured" } },
						{ status: 503 },
					),
					true,
				);
			return secure(await auth.handler(event.request), true);
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

	return secure(
		response,
		PRIVATE_PREFIXES.some((prefix) => isUnder(pathname, prefix)),
	);
};

function clientAddress(event: { getClientAddress: () => string }): string {
	try {
		return event.getClientAddress();
	} catch {
		// Some adapters cannot tell the address; those requests share one bucket.
		return "unknown";
	}
}

/**
 * Headers for every response the server renders. Prerendered pages are served by the platform without passing
 * here, so the same headers are repeated in `vercel.json` and `static/_headers`: keep the three in step.
 */
function secure(response: Response, isPrivate: boolean): Response {
	const { headers } = response;
	headers.set("X-Content-Type-Options", "nosniff");
	// Nothing on the site is meant to be framed; this is what stops clickjacking on /admin.
	headers.set("X-Frame-Options", "DENY");
	headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
	headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");

	if (isPrivate) {
		// Belt and braces with robots.txt: private areas must never be indexed, even if linked from elsewhere.
		headers.set("X-Robots-Tag", "noindex, nofollow");
		// The API sets its own caching where a response may be shared; everything else here is per admin.
		if (!headers.has("Cache-Control")) headers.set("Cache-Control", "no-store");
	}
	return response;
}
