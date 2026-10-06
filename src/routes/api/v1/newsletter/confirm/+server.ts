import { json } from "@sveltejs/kit";
import { z } from "zod";
import { ApiError, parseBody, respond } from "#lib/server/api.ts";
import { getDb } from "#lib/server/db/index.ts";
import { confirm } from "#lib/server/newsletter.ts";

const bodySchema = z.object({ token: z.string().min(1).max(200) });

/**
 * Confirms a subscription with the token of the confirmation e-mail.
 * It is a POST behind a button, not something that happens when the link is opened:
 * e-mail scanners open every link, and would confirm subscriptions made by someone else.
 */
export function POST({ request }) {
	return respond(async () => {
		const { token } = await parseBody(bodySchema, request);
		if (!(await confirm(await getDb(), token)))
			throw new ApiError(404, "not_found", "Unknown or expired confirmation token");

		return json({ data: { status: "confirmed" } });
	});
}
