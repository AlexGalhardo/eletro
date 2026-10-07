import { getPosts } from "#lib/server/content.ts";

// The whole public site is static: content only changes through a commit, which triggers a rebuild.
export const prerender = true;

export function load() {
	const posts = getPosts();
	return {
		// Categories with at least one published post; the others stay out of the filter and the footer.
		activeCategories: [...new Set(posts.map((post) => post.category))],
		// ponytail: every title ships with every page; switch to a fetched index past a few hundred posts.
		searchIndex: posts.map(({ slug, title }) => ({ slug, title })),
	};
}
