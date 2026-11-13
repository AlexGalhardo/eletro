import { z } from "zod";
import { slugSchema } from "#lib/content/schema.ts";
import { parseBody, requireAdmin, respond } from "#lib/server/api.ts";
import { getPost, NotFoundError, ValidationError } from "#lib/server/cms.ts";
import { getDb } from "#lib/server/db/index.ts";
import { json } from "#lib/server/http.ts";
import { requestDispatch } from "#lib/server/newsletter.ts";
import { getStore } from "#lib/server/store/index.ts";

const bodySchema = z.object({ slug: slugSchema });

/**
 * Queues the announcement of a post to the subscribers. It is sent by the dispatch run once the post is live.
 * Asking again for the same post never sends twice; it only puts a failed dispatch back in the queue.
 */
export function POST({ request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { slug } = await parseBody(bodySchema, request);

		const entry = await getPost(getStore(), slug);
		if (!entry) throw new NotFoundError(`Post "${slug}"`);
		if (entry.post.draft)
			throw new ValidationError(["Um rascunho não pode ser anunciado aos assinantes."]);

		const dispatch = await requestDispatch(await getDb(), slug, author.name);
		return json(
			{ data: { slug, status: dispatch.status, recipients: dispatch.recipients } },
			{ status: 202 },
		);
	});
}
