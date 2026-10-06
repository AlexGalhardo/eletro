import { json } from "@sveltejs/kit";
import { getPosts } from "#lib/server/content.ts";
import { site } from "#lib/site.config.ts";

export function GET() {
	const posts = getPosts();
	return json({
		data: site.categories.map(({ id, label }) => ({
			id,
			label,
			posts: posts.filter((post) => post.category === id).length,
		})),
	});
}
