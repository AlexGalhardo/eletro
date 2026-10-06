import { BuildError, buildDraft } from "../../../webscrapping/build.ts";
import { FetchError, fetchLimited, isAllowedUrl } from "../../../webscrapping/fetch.ts";
import { parsePostHtml } from "../../../webscrapping/parse.ts";
import { today } from "../content/parse.ts";
import { site } from "../site.config.ts";
import {
	type Author,
	getPost,
	getProductList,
	MAX_IMAGE_BYTES,
	savePost,
	saveProductList,
	uploadImage,
	ValidationError,
} from "./cms.ts";
import type { ContentStore } from "./store/types.ts";

/** A review page with ten products is about 0.6 MB; anything far above that is not a post. */
const MAX_PAGE_BYTES = 3 * 1024 * 1024;

export type ImportResult = { slug: string; list: string; products: number; source: string };

/**
 * Reads a review post from an allowed source site and stores it as a draft: product images,
 * product list and post, in that order, because each step is validated against the previous one.
 * With the GitHub store every write is one commit, so they run one after the other.
 * ponytail: a failure halfway leaves the images already uploaded in the store (harmless orphans);
 * add a cleanup step if they pile up.
 */
export async function importPost(
	store: ContentStore,
	url: string,
	author: Author,
	now = new Date(),
): Promise<ImportResult> {
	const { sourceHosts, imageHosts, maxProducts } = site.postImport;
	if (!isAllowedUrl(url, sourceHosts))
		throw new ValidationError([`Informe um endereço https de: ${sourceHosts.join(", ")}.`]);

	try {
		const html = new TextDecoder().decode(
			await fetchLimited(url, { allowedHosts: sourceHosts, maxBytes: MAX_PAGE_BYTES }),
		);
		const draft = buildDraft(parsePostHtml(html, url), {
			categories: site.categories.map((category) => category.id),
			date: today(now),
			maxProducts,
		});

		// Checked before any upload, so importing the same page twice writes nothing.
		const [post, list] = await Promise.all([
			getPost(store, draft.slug),
			getProductList(store, draft.list),
		]);
		if (post || list)
			throw new ValidationError([
				`Já existe um post ou uma lista de produtos chamada "${draft.slug}". Edite o conteúdo existente.`,
			]);

		const products = [];
		for (const [index, product] of draft.products.entries()) {
			// The image URL comes from the scraped page, so it gets the same allow-list check as the page.
			if (!product.image || !isAllowedUrl(product.image, imageHosts))
				throw new ValidationError([
					`A imagem do produto "${product.name}" não está em um endereço permitido: ${product.image ?? "sem imagem"}.`,
				]);
			const bytes = await fetchLimited(product.image, {
				allowedHosts: imageHosts,
				maxBytes: MAX_IMAGE_BYTES,
			});
			const uploaded = await uploadImage(
				store,
				{ folder: "posts", filename: `${draft.slug}-${index + 1}`, type: "", bytes },
				author,
			);
			products.push({ ...product, image: uploaded.url });
		}

		await saveProductList(store, draft.list, products, author);
		await savePost(store, draft.slug, draft.post, author);

		return { slug: draft.slug, list: draft.list, products: products.length, source: url };
	} catch (error) {
		if (error instanceof FetchError || error instanceof BuildError)
			throw new ValidationError([error.message]);
		throw error;
	}
}
