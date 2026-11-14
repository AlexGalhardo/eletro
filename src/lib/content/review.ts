// Pure decisions behind the review UX: which product the verdict names and which columns the comparison table has.
import { type Store, storeLinks } from "../affiliate-links.ts";
import { site } from "../site.config.ts";
import { fallbackHref, productHref } from "./affiliate.ts";
import type { Product } from "./schema.ts";

export const MAX_COMPARED_COLUMNS = 5;

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

export function productScore(product: Product): number | null {
	return typeof product.score === "number" ? product.score : null;
}

/** The verdict names the best score, then a product the editors badged "nossa escolha", then the first one. */
export function pickTopProduct(products: Product[]): Product | undefined {
	const withLink = products.filter((product) => storeLinks(product).length > 0);
	const scored = withLink.filter((product) => productScore(product) !== null);
	if (scored.length > 0)
		return scored.reduce((best, item) =>
			(productScore(item) ?? 0) > (productScore(best) ?? 0) ? item : best,
		);
	const badged = withLink.find((product) => String(product.badge ?? "").toLowerCase() === "nossa escolha");
	return badged ?? withLink[0];
}

/** Labels shared by at least two products, most common first: the only ones worth comparing side by side. */
export function comparisonColumns(products: Product[]): string[] {
	const counts = new Map<string, number>();
	for (const product of products)
		for (const label of new Set(specifiedDetails(product).map((detail) => detail.label)))
			counts.set(label, (counts.get(label) ?? 0) + 1);
	return [...counts]
		.filter(([, count]) => count >= 2)
		.sort((a, b) => b[1] - a[1])
		.slice(0, MAX_COMPARED_COLUMNS)
		.map(([label]) => label);
}

export function formatScore(value: number): string {
	return value.toLocaleString(site.locale, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
}
