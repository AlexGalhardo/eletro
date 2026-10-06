import { json } from "@sveltejs/kit";
import { z } from "zod";
import { ApiError, parseBody, respond } from "#lib/server/api.ts";
import { getDb } from "#lib/server/db/index.ts";
import { unsubscribe } from "#lib/server/newsletter.ts";

const bodySchema = z.object({ token: z.string().min(1).max(200) });

/** Unsubscribes the owner of the token found in every newsletter e-mail. No sign-in involved. */
export function POST({ request }) {
	return respond(async () => {
		const { token } = await parseBody(bodySchema, request);
		if (!(await unsubscribe(await getDb(), token)))
			throw new ApiError(404, "not_found", "Unknown unsubscribe token");

		return json({ data: { status: "unsubscribed" } });
	});
}
