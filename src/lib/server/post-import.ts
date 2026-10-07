import { BuildError, buildDraft, topicOf } from "../../../webscrapping/build.ts";
import { FetchError, fetchLimited, isAllowedUrl } from "../../../webscrapping/fetch.ts";
import { parsePostHtml } from "../../../webscrapping/parse.ts";
import { RewriteError, type Rewritten, rewriteTexts } from "../../../webscrapping/rewrite.ts";
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

export type ImportResult = {
	slug: string;
	list: string;
	products: number;
	source: string;
	/** True when the summary and FAQ were rewritten by Mistral; false means the template texts. */
	rewritten: boolean;
	/** Why the rewrite did not happen, in Portuguese for the editor. Absent when it did. */
	rewriteWarning?: string;
};

/**
 * Reads a review post from an allowed source site and stores it as a draft: product images,
 * product list and post, in that order, because each step is validated against the previous one.
 * With the GitHub store every write is one commit, so they run one after the other.
 * ponytail: a failure halfway leaves the images already uploaded in the store (harmless orphans);
 * add a cleanup step if they pile up.
 * With `mistralApiKey`, the source summary and FAQ are rewritten by Mistral; if that fails, the draft
 * keeps the template texts and the result says why, so a flaky LLM never blocks an import.
 */
export async function importPost(
	store: ContentStore,
	url: string,
	author: Author,
	now = new Date(),
	mistralApiKey?: string,
): Promise<ImportResult> {
	const { sourceHosts, imageHosts, maxProducts } = site.postImport;
	if (!isAllowedUrl(url, sourceHosts))
		throw new ValidationError([`Informe um endereço https de: ${sourceHosts.join(", ")}.`]);

	try {
		const html = new TextDecoder().decode(
			await fetchLimited(url, { allowedHosts: sourceHosts, maxBytes: MAX_PAGE_BYTES }),
		);
		const scraped = parsePostHtml(html, url);
		const options = {
			categories: site.categories.map((category) => category.id),
			date: today(now),
			maxProducts,
		};
		// Built once without the LLM first: a page that cannot become a draft fails before any API call.
		let draft = buildDraft(scraped, options);

		let rewritten: Rewritten | null = null;
		let rewriteWarning: string | undefined;
		if (!mistralApiKey) rewriteWarning = "MISTRAL_API_KEY não configurada: o texto é o modelo genérico.";
		else if (!scraped.summary && scraped.faq.length === 0)
			rewriteWarning = "A origem não tem resumo nem FAQ para reescrever.";
		else {
			try {
				rewritten = await rewriteTexts(scraped, topicOf(scraped), mistralApiKey);
				draft = buildDraft(scraped, { ...options, rewritten });
			} catch (error) {
				if (!(error instanceof RewriteError)) throw error;
				console.warn(`[import] ${error.message}`);
				rewriteWarning = `${error.message} O rascunho ficou com o texto genérico.`;
			}
		}

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

		return {
			slug: draft.slug,
			list: draft.list,
			products: products.length,
			source: url,
			rewritten: rewritten !== null,
			...(rewriteWarning && { rewriteWarning }),
		};
	} catch (error) {
		if (error instanceof FetchError || error instanceof BuildError)
			throw new ValidationError([error.message]);
		throw error;
	}
}
