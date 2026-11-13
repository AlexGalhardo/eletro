import { describe, expect, it } from "vitest";
import { recommendedPosts } from "./recommendations.ts";

const kitchen = { slug: "a", category: "cozinha" };
const kitchenNewer = { slug: "b", category: "cozinha" };
const home = { slug: "c", category: "casa" };
const kitchenOlder = { slug: "d", category: "cozinha" };
const posts = [kitchen, kitchenNewer, home, kitchenOlder];

describe("recommendedPosts", () => {
	it("puts the same category first and skips the current post", () => {
		expect(recommendedPosts(posts, kitchen, 3).map((post) => post.slug)).toEqual(["b", "d", "c"]);
	});

	it("fills with other categories when the same one runs out", () => {
		expect(recommendedPosts(posts, home, 3).map((post) => post.slug)).toEqual(["a", "b", "d"]);
	});

	it("keeps five posts when no limit is given", () => {
		const many = Array.from({ length: 8 }, (_, index) => ({ slug: String(index), category: "cozinha" }));
		expect(recommendedPosts(many, { slug: "x", category: "casa" })).toHaveLength(5);
	});

	it("returns nothing when the current post is the only one", () => {
		expect(recommendedPosts([kitchen], kitchen)).toEqual([]);
	});
});
