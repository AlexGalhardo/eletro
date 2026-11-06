import { json } from "@sveltejs/kit";
import { z } from "zod";
import { parseBody, requireAdmin, respond } from "#lib/server/api.ts";
import { importPost } from "#lib/server/post-import.ts";
import { getStore } from "#lib/server/store/index.ts";
import { MISTRAL_API_KEY } from "$app/env/private";

// The host allow list is enforced by the import service, which answers with a message meant for the editor.
const importSchema = z.object({ url: z.string().trim().min(1).max(500) });

/** Scrapes a review post from an allowed source site and stores it as a draft. */
export function POST({ request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { url } = await parseBody(importSchema, request);

		return json(
			{ data: await importPost(getStore(), url, author, new Date(), MISTRAL_API_KEY) },
			{ status: 201 },
		);
	});
}
