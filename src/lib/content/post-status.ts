// One row per post with what an editor needs to manage hundreds of drafts: is it live, and how many
// affiliate links are real versus still "#". Shared by `bun run post-status` (docs/post-status.md) and /admin.
import { STORES, type StoreUrls, storeLinks } from "../affiliate-links.ts";
import type { Post } from "./schema.ts";

export interface LinkCounts {
	/** Store fields with a real https address. */
	links: number;
	/** Store fields still holding the "#" placeholder. */
	pending: number;
}

export interface PostStatusRow extends LinkCounts {
	slug: string;
	title: string;
	category: string;
	draft: boolean;
	products: number;
}

const FIELDS = { mercadolivre: "mercadolivreUrl", amazon: "amazonUrl", shopee: "shopeeUrl" } as const;

export function linkCounts(products: StoreUrls[]): LinkCounts {
	let links = 0;
	let pending = 0;
	for (const product of products) {
		links += storeLinks(product).length;
		pending += STORES.filter((store) => product[FIELDS[store]]?.trim() === "#").length;
	}
	return { links, pending };
}

export function postStatusRow(
	post: Pick<Post, "slug" | "title" | "category" | "draft">,
	lists: string[],
	productLists: Map<string, StoreUrls[]>,
): PostStatusRow {
	const products = lists.flatMap((list) => productLists.get(list) ?? []);
	return {
		slug: post.slug,
		title: post.title,
		category: post.category,
		draft: post.draft,
		products: products.length,
		...linkCounts(products),
	};
}

const cell = (text: string): string => text.replaceAll("|", "\\|").replace(/\s+/g, " ").trim();

export function postStatusMarkdown(rows: PostStatusRow[]): string {
	const sorted = [...rows].sort((a, b) => a.slug.localeCompare(b.slug));
	const drafts = sorted.filter((row) => row.draft).length;
	const total = linkCounts([]);
	for (const row of sorted) {
		total.links += row.links;
		total.pending += row.pending;
	}
	return [
		"# Status dos posts",
		"",
		"Gerado por `bun run post-status` a partir de `content/`. Não edite à mão: rode o comando depois de",
		"mudar posts ou listas de produtos. O teste `tests/integration/post-status.test.ts` falha quando esta",
		"tabela fica desatualizada. A mesma informação aparece em `/admin/posts`.",
		"",
		"- **Links:** campos de loja com endereço real (`https://`).",
		'- **Pendentes:** campos de loja ainda com `"#"`, esperando o link de afiliado.',
		"",
		`Total: ${sorted.length} posts, ${sorted.length - drafts} fora de rascunho, ${drafts} rascunhos,`,
		`${total.links} links de afiliado e ${total.pending} pendentes.`,
		"",
		"| Slug | Título | Categoria | Draft | Produtos | Links | Pendentes |",
		"|---|---|---|---|---|---|---|",
		...sorted.map(
			(row) =>
				`| [${row.slug}](../content/posts/${row.slug}.mdx) | ${cell(row.title)} | ${row.category} | ` +
				`${row.draft} | ${row.products} | ${row.links} | ${row.pending} |`,
		),
		"",
	].join("\n");
}
