// This site's side of the links dashboard contract (src/lib/affiliate-links.ts): which products are registered
// and under which id. Shared by the product cards and by the build script, so both always agree.
import {
	affiliateHref,
	type CatalogueProduct,
	isAffiliateUrl,
	type Store,
	storeLinks,
} from "../affiliate-links.ts";
import { site } from "../site.config.ts";
import { referencedLists } from "./parse.ts";
import type { Post, Product } from "./schema.ts";

export function productExternalId(postSlug: string, productId: string): string {
	return `${site.url}/${postSlug}/${productId}`;
}

/** The site-wide offer used by a product that has no store link of its own. */
export const FALLBACK_EXTERNAL_ID = `${site.url}/ofertas`;

export function productHref(postSlug: string, productId: string, store: Store): string {
	return affiliateHref(site.linksDashboardUrl, productExternalId(postSlug, productId), store);
}

export const fallbackHref = affiliateHref(site.linksDashboardUrl, FALLBACK_EXTERNAL_ID, "mercadolivre");

/**
 * Everything the public site links to: the products of every list a published post shows, plus the fallback.
 * A product without a real store link is left out: its card points to the fallback instead.
 */
export function buildCatalogue(
	posts: { post: Pick<Post, "slug">; body: string }[],
	lists: Map<string, Product[]>,
): CatalogueProduct[] {
	const catalogue: CatalogueProduct[] = [];
	for (const { post, body } of posts) {
		for (const list of referencedLists(body)) {
			for (const product of lists.get(list) ?? []) {
				const links = storeLinks(product);
				if (links.length === 0) continue;
				catalogue.push({
					externalId: productExternalId(post.slug, product.id),
					name: product.name.slice(0, 200),
					pageUrl: `${site.url}/${post.slug}`,
					category: post.slug,
					links,
				});
			}
		}
	}
	if (isAffiliateUrl(site.fallbackAffiliateUrl))
		catalogue.push({
			externalId: FALLBACK_EXTERNAL_ID,
			name: `${site.name}: ofertas`,
			pageUrl: site.url,
			links: [{ url: site.fallbackAffiliateUrl, store: "mercadolivre" }],
		});
	return catalogue;
}
