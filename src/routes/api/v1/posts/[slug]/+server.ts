import { json } from "@sveltejs/kit";
import { z } from "zod";
import { ApiError, parseBody, parseQuery, requireAdmin, respond } from "#lib/server/api.ts";
import { deletePost, NotFoundError, getPost as readStoredPost, savePost } from "#lib/server/cms.ts";
import { getPost } from "#lib/server/content.ts";
import { getStore } from "#lib/server/store/index.ts";

const versionSchema = z.object({ sha: z.string().min(1) });
const updateSchema = z.looseObject(versionSchema.shape);

/** A published post with its Markdown body. Drafts and scheduled posts answer 404. */
export function GET({ params }) {
	return respond(() => {
		const entry = getPost(params.slug);
		if (!entry) throw new ApiError(404, "not_found", `Post "${params.slug}" not found`);

		return json({ data: { ...entry.post, body: entry.body.trim() } });
	});
}

/** Replaces the version identified by `sha`. A stale `sha` answers 409 instead of overwriting. */
export function PUT({ params, request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { sha, ...input } = await parseBody(updateSchema, request);

		const store = getStore();
		// A stored post that no longer parses still exists, and saving over it is how it gets fixed.
		const exists = await readStoredPost(store, params.slug).then(Boolean, () => true);
		if (!exists) throw new NotFoundError(`Post "${params.slug}"`);

		return json({ data: await savePost(store, params.slug, input, author, sha) });
	});
}

export function DELETE({ params, url, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { sha } = parseQuery(versionSchema, url);

		await deletePost(getStore(), params.slug, author, sha);
		return new Response(null, { status: 204 });
	});
}
