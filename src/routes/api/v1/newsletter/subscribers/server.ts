import { json } from "@sveltejs/kit";
import { z } from "zod";
import { parseBody, respond } from "#lib/server/api.ts";
import { getDb } from "#lib/server/db/index.ts";
import { subscribe } from "#lib/server/newsletter.ts";
import { linkOrigin } from "#lib/server/origin.ts";

const bodySchema = z.object({ email: z.email().max(254) });

/** Starts a double opt-in subscription. The answer is the same whether or not the address is already known. */
export function POST({ request, url }) {
	return respond(async () => {
		const { email } = await parseBody(bodySchema, request);
		await subscribe(await getDb(), email, linkOrigin(url));

		return json({ data: { status: "pending" } }, { status: 202 });
	});
}
