import { CRON_SECRET } from "#env";
import { ApiError, respond, safeEqual } from "#lib/server/api.ts";
import { getPost } from "#lib/server/content.ts";
import { getDb } from "#lib/server/db/index.ts";
import { json } from "#lib/server/http.ts";
import { runDispatches } from "#lib/server/newsletter.ts";
import { linkOrigin } from "#lib/server/origin.ts";

const hasCronToken = (request: Request) => {
	const token = request.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
	// A short secret could be guessed by trying; it is treated as not configured.
	return Boolean(CRON_SECRET && CRON_SECRET.length >= 32 && token && safeEqual(token, CRON_SECRET));
};

async function run(url: URL): Promise<Response> {
	const results = await runDispatches(await getDb(), {
		origin: linkOrigin(url),
		// Live means published in the running deploy: the bundled content is exactly what the site serves.
		livePost: (slug) => getPost(slug)?.post,
	});
	return json({ data: results });
}

/** Sends the queued announcements whose post is live. For an admin, or a scheduler holding CRON_SECRET. */
export function POST({ request, url, locals }) {
	return respond(() => {
		if (!locals.admin && !hasCronToken(request))
			throw new ApiError(401, "unauthorized", "Sign in as an admin or send the cron token");
		return run(url);
	});
}

/** Same as POST, for schedulers that can only call with GET (Vercel Cron). Accepts the cron token only. */
export function GET({ request, url }) {
	return respond(() => {
		if (!hasCronToken(request)) throw new ApiError(401, "unauthorized", "Send the cron token");
		return run(url);
	});
}
