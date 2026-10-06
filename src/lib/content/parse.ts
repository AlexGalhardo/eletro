import matter from "gray-matter";
import { type Post, type PostFrontmatter, postFrontmatterSchema } from "./schema.ts";

const WORDS_PER_MINUTE = 200;

export function countWords(markdown: string): number {
	return markdown.split(/\s+/).filter(Boolean).length;
}

/** Parses the raw text of a post file. Throws a readable error when the frontmatter is invalid. */
export function parsePost(slug: string, raw: string): { post: Post; body: string } {
	const { data, content } = matter(raw);
	const result = postFrontmatterSchema.safeParse(data);
	if (!result.success) {
		const issues = result.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);
		throw new Error(`Invalid frontmatter in post "${slug}": ${issues.join("; ")}`);
	}
	const wordCount = countWords(content);
	return {
		post: {
			...result.data,
			slug,
			wordCount,
			readingMinutes: Math.max(1, Math.ceil(wordCount / WORDS_PER_MINUTE)),
		},
		body: content,
	};
}

/** Serializes a post back to the file format, with a stable key order so diffs stay small. */
export function serializePost(frontmatter: PostFrontmatter, body: string): string {
	const ordered = Object.fromEntries(
		Object.entries(postFrontmatterSchema.parse(frontmatter)).filter(([, value]) => value !== undefined),
	);
	return matter.stringify(`\n${body.trim()}\n`, ordered);
}

/** Today in the site timezone-agnostic YYYY-MM-DD form used by post dates. */
export function today(now = new Date()): string {
	return now.toISOString().slice(0, 10);
}

export function isPublished(post: Pick<Post, "draft" | "date">, now = new Date()): boolean {
	return !post.draft && post.date <= today(now);
}

/** Names of the product lists a post body references through `<CardsTable list="..." />`. */
export function referencedLists(body: string): string[] {
	return [...body.matchAll(/<CardsTable\s+list="([^"]+)"/g)].map((match) => match[1] as string);
}
