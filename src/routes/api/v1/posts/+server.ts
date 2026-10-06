import { json } from "@sveltejs/kit";
import { z } from "zod";
import { slugSchema } from "#lib/content/schema.ts";
import { parseBody, parseQuery, requireAdmin, respond } from "#lib/server/api.ts";
import { savePost } from "#lib/server/cms.ts";
import { getPosts } from "#lib/server/content.ts";
import { getStore } from "#lib/server/store/index.ts";

const querySchema = z.object({
	page: z.coerce.number().int().min(1).default(1),
	pageSize: z.coerce.number().int().min(1).max(100).default(20),
	category: z.string().optional(),
	q: z.string().trim().optional(),
});

// The post fields are validated by the CMS service, which answers with messages meant for the editor.
const createSchema = z.looseObject({ slug: slugSchema });

/** Lowercase and without accents, so "cafe" finds "Café". */
const fold = (text: string) => text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

/** Published posts, newest first. */
export function GET({ url }) {
	return respond(() => {
		const { page, pageSize, category, q } = parseQuery(querySchema, url);
		const term = q ? fold(q) : "";

		const matches = getPosts().filter(
			(post) =>
				(!category || post.category === category) &&
				(!term || fold(`${post.title} ${post.description}`).includes(term)),
		);

		return json({
			data: matches.slice((page - 1) * pageSize, page * pageSize),
			pagination: {
				page,
				pageSize,
				totalItems: matches.length,
				totalPages: Math.ceil(matches.length / pageSize),
			},
		});
	});
}

export function POST({ request, locals }) {
	return respond(async () => {
		const author = requireAdmin(locals);
		const { slug, ...input } = await parseBody(createSchema, request);

		return json({ data: await savePost(getStore(), slug, input, author) }, { status: 201 });
	});
}
