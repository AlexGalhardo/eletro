// Writes docs/post-status.md: one row per post with its draft flag and affiliate link counts.
//   bun run post-status   regenerate the file
// tests/integration/post-status.test.ts fails while the file is stale, so the pre-push hook catches it.
import { readdirSync, readFileSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parsePost, referencedLists } from "../src/lib/content/parse.ts";
import { postStatusMarkdown, postStatusRow } from "../src/lib/content/post-status.ts";
import { type Product, productListSchema } from "../src/lib/content/schema.ts";

export const POST_STATUS_FILE = "docs/post-status.md";

const filesOf = (folder: string, extension: string): string[] =>
	readdirSync(folder)
		.filter((file) => file.endsWith(extension))
		.map((file) => file.slice(0, -extension.length));

export function renderPostStatus(root = "."): string {
	const lists = new Map<string, Product[]>(
		filesOf(join(root, "content/products"), ".json").map((name) => [
			name,
			productListSchema.parse(
				JSON.parse(readFileSync(join(root, `content/products/${name}.json`), "utf8")),
			),
		]),
	);
	const rows = filesOf(join(root, "content/posts"), ".mdx").map((slug) => {
		const { post, body } = parsePost(slug, readFileSync(join(root, `content/posts/${slug}.mdx`), "utf8"));
		return postStatusRow(post, [...new Set(referencedLists(body))], lists);
	});
	return postStatusMarkdown(rows);
}

if (import.meta.main) {
	writeFileSync(POST_STATUS_FILE, renderPostStatus());
	console.log(`${POST_STATUS_FILE} updated.`);
}
