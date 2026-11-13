export type RecommendationSource = {
	slug: string;
	category: string;
};

/**
 * Same category first, then the rest, in the order given (callers pass newest first).
 * The current post is left out. `limit` caps the sidebar.
 */
export function recommendedPosts<T extends RecommendationSource>(
	posts: readonly T[],
	current: RecommendationSource,
	limit = 7,
): T[] {
	const others = posts.filter((post) => post.slug !== current.slug);
	const sameCategory = others.filter((post) => post.category === current.category);
	const otherCategories = others.filter((post) => post.category !== current.category);
	return [...sameCategory, ...otherCategories].slice(0, limit);
}
