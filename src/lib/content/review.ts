// Pure decisions behind the product cards: which details to show and where an offer button points.
import { type Store, storeLinks } from "../affiliate-links.ts";
import { site } from "../site.config.ts";
import { fallbackHref, productHref } from "./affiliate.ts";
import type { Product } from "./schema.ts";

/** Technical details worth showing: the ones the product actually fills in. */
export function specifiedDetails(product: Product): Product["technicalDetails"] {
	return product.technicalDetails.filter(
		(detail) => detail.value && detail.value.trim().toLowerCase() !== "não especificado",
	);
}

/** Where an offer button points: the dashboard redirect plus the direct store address used if the dashboard is down. */
export function offerTarget(
	postSlug: string,
	product: Product,
	store?: Store,
): { dashboard: string; direct: string; store: Store } {
	const link = storeLinks(product).find((candidate) => !store || candidate.store === store);
	if (!link)
		return { dashboard: fallbackHref, direct: site.fallbackAffiliateUrl, store: store ?? "mercadolivre" };
	return { dashboard: productHref(postSlug, product.id, link.store), direct: link.url, store: link.store };
}
