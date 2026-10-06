import { json, redirect } from "@sveltejs/kit";
import type { Handle } from "@sveltejs/kit/hooks";
import { getAdmin, getAuth } from "#lib/server/auth.ts";
import { site } from "#lib/site.config.ts";
import { building } from "$app/env";

const PRIVATE_PREFIXES = ["/admin", "/api"];
const LOGIN = "/admin/login";

const isUnder = (pathname: string, prefix: string) =>
	pathname === prefix || pathname.startsWith(`${prefix}/`);

export const handle: Handle = async ({ event, resolve }) => {
	const { pathname } = event.url;
	event.locals.admin = null;

	// Sessions are only looked up where they matter, so public pages never touch the database.
	const needsSession = isUnder(pathname, "/admin") || isUnder(pathname, "/api");
	if (needsSession && !building) {
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

	return PRIVATE_PREFIXES.some((prefix) => isUnder(pathname, prefix)) ? withNoIndex(response) : response;
};

// Belt and braces with robots.txt: private areas must never be indexed, even if linked from elsewhere.
function withNoIndex(response: Response): Response {
	response.headers.set("X-Robots-Tag", "noindex, nofollow");
	return response;
}
