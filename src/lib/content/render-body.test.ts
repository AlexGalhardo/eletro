import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { isPublished, parsePost, referencedLists } from "./parse.ts";
import { renderPostBody } from "./render-body.ts";

const postsDir = path.resolve(import.meta.dirname, "../../../content/posts");

const posts = readdirSync(postsDir)
	.filter((file) => file.endsWith(".mdx"))
	.map((file) => {
		const slug = file.replace(/\.mdx$/, "");
		return parsePost(slug, readFileSync(path.join(postsDir, file), "utf8"));
	})
	.filter(({ post }) => isPublished(post));

describe("renderPostBody", () => {
	it("turns every published post into HTML plus the product tables the file names", () => {
		expect(posts.length).toBeGreaterThan(0);

		for (const { body } of posts) {
			const segments = renderPostBody(body);
			const lists = segments.flatMap((segment) => (segment.kind === "cards" ? [segment.list] : []));
			expect(lists).toEqual([...referencedLists(body)]);

			const html = segments
				.flatMap((segment) => (segment.kind === "html" ? [segment.html] : []))
				.join("");
			expect(html).not.toContain("<CardsTable");

			const prose = body.replace(/<CardsTable\s+list="[^"]+"\s*\/>/g, "").trim();
			if (prose) expect(html.length).toBeGreaterThan(0);
		}
	});
});
