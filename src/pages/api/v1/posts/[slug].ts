import type { APIRoute } from "astro";
import { getPosts } from "#lib/server/content.ts";
import { GET as handler } from "../../../../routes/api/v1/posts/[slug]/server.ts";

export function getStaticPaths() {
	return getPosts().map((post) => ({ params: { slug: post.slug } }));
}

export const GET: APIRoute = ({ params }) => handler({ params: { slug: params.slug ?? "" } });
