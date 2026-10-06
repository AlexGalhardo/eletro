import { getPosts } from "#lib/server/content.ts";

// The whole public site is static: content only changes through a commit, which triggers a rebuild.
export const prerender = true;

export function load() {
	return {
		// ponytail: every title ships with every page; switch to a fetched index past a few hundred posts.
		searchIndex: getPosts().map(({ slug, title }) => ({ slug, title })),
	};
}
