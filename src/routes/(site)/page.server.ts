import { coverWidths, getPosts } from "#lib/server/content.ts";

export function load() {
	return {
		posts: getPosts().map(({ slug, title, description, cover, date, category }) => ({
			slug,
			title,
			description,
			cover,
			coverWidths: coverWidths(cover),
			date,
			category,
		})),
		jsonLdPosts: getPosts().slice(0, 8),
	};
}
