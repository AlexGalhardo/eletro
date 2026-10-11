// Contract with the links dashboard (docs/api.md in the links.lekzera.xyz repository).
// Portable on purpose: no framework and no Node imports, so the same file serves every site and its build script.

export const STORES = ["mercadolivre", "amazon", "shopee"] as const;
export type Store = (typeof STORES)[number];

export interface CatalogueLink {
	url: string;
	store: Store;
}

export interface CatalogueProduct {
	/** Stable and unique across every site: <site url>/<page>/<product id>. */
	externalId: string;
	name?: string;
	pageUrl?: string;
	category?: string;
	links: CatalogueLink[];
}

export interface StoreUrls {
	mercadolivreUrl?: string | null;
	amazonUrl?: string | null;
	shopeeUrl?: string | null;
}

const FIELD: Record<Store, keyof StoreUrls> = {
	mercadolivre: "mercadolivreUrl",
	amazon: "amazonUrl",
	shopee: "shopeeUrl",
};

/** Placeholders ("#", "", null) are not links: only an https address is registered and rendered. */
export function isAffiliateUrl(value: unknown): value is string {
	return typeof value === "string" && /^https:\/\/\S+$/.test(value.trim());
}

export function storeLinks(product: StoreUrls): CatalogueLink[] {
	return STORES.flatMap((store) => {
		const url = product[FIELD[store]];
		return isAffiliateUrl(url) ? [{ url: url.trim(), store }] : [];
	});
}

/** The only address a button may point to: the dashboard redirect, never the store itself. */
export function affiliateHref(dashboardUrl: string, externalId: string, store: Store): string {
	return `${dashboardUrl.replace(/\/+$/, "")}/link?id=${encodeURIComponent(externalId)}&store=${store}`;
}

/** Problems that would make the dashboard refuse the catalogue, found before any network call. */
export function catalogueProblems(products: CatalogueProduct[]): string[] {
	const problems: string[] = [];
	const seen = new Set<string>();
	for (const product of products) {
		if (seen.has(product.externalId)) problems.push(`${product.externalId}: id repetido`);
		seen.add(product.externalId);
		if (product.links.length === 0) problems.push(`${product.externalId}: sem link de afiliado`);
	}
	return problems;
}

const CSV_HEADER = ["externalId", "url", "name", "pageUrl", "category", "store"] as const;

const csvCell = (value: string): string =>
	/[",\r\n]/.test(value) ? `"${value.replaceAll('"', '""')}"` : value;

/**
 * The catalogue as the CSV the dashboard imports: one row per link, rows of a product share its externalId.
 * The JSON export is the catalogue itself (JSON.stringify), so both files carry the same data.
 */
export function catalogueToCsv(products: CatalogueProduct[]): string {
	const rows = products.flatMap((product) =>
		product.links.map((link) => [
			product.externalId,
			link.url,
			product.name ?? "",
			product.pageUrl ?? "",
			product.category ?? "",
			link.store,
		]),
	);
	return `${[CSV_HEADER, ...rows].map((row) => row.map(csvCell).join(",")).join("\n")}\n`;
}

export interface SyncSummary {
	productsCreated: number;
	productsUpdated: number;
	productsRemoved: number;
	linksAdded: number;
	linksRemoved: number;
	errors: string[];
}

export interface SyncOptions {
	dashboardUrl: string;
	token: string;
	products: CatalogueProduct[];
	fetch?: typeof fetch;
	attempts?: number;
	retryDelayMs?: number;
	timeoutMs?: number;
}

export class SyncError extends Error {}

const sleep = (ms: number): Promise<void> => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Sends the whole catalogue with PUT /api/v1/links and resolves only when the dashboard applied all of it.
 * Network failures and 5xx are retried (the call is idempotent); every other outcome throws a SyncError.
 */
export async function syncCatalogue(options: SyncOptions): Promise<SyncSummary> {
	const { dashboardUrl, token, products, attempts = 3, retryDelayMs = 2000, timeoutMs = 120_000 } = options;
	const request = options.fetch ?? fetch;
	const problems = catalogueProblems(products);
	if (products.length === 0) problems.push("catálogo vazio");
	if (problems.length) throw new SyncError(`Catálogo inválido:\n- ${problems.join("\n- ")}`);

	let last = "";
	for (let attempt = 1; attempt <= attempts; attempt++) {
		if (attempt > 1) await sleep(retryDelayMs);
		let response: Response;
		try {
			response = await request(`${dashboardUrl.replace(/\/+$/, "")}/api/v1/links`, {
				method: "PUT",
				headers: { authorization: `Bearer ${token}`, "content-type": "application/json" },
				body: JSON.stringify(products),
				signal: AbortSignal.timeout(timeoutMs),
			});
		} catch (error) {
			last = `dashboard inacessível (${error instanceof Error ? error.message : String(error)})`;
			continue;
		}
		if (response.status >= 500) {
			last = `dashboard respondeu ${response.status}`;
			continue;
		}
		const body = (await response.json().catch(() => null)) as
			| (Partial<SyncSummary> & { error?: string })
			| null;
		if (response.status === 401)
			throw new SyncError("Token do dashboard ausente, errado ou revogado (401).");
		if (response.status === 409)
			throw new SyncError(
				"O dashboard recusou: o site do projeto não respondeu (409 project_offline).",
			);
		if (response.status === 207)
			throw new SyncError(
				`O dashboard recusou parte do catálogo:\n- ${(body?.errors ?? []).join("\n- ")}`,
			);
		if (response.status !== 200 || !body)
			throw new SyncError(
				`Resposta inesperada do dashboard: ${response.status} ${body?.error ?? ""}`.trim(),
			);
		return {
			productsCreated: body.productsCreated ?? 0,
			productsUpdated: body.productsUpdated ?? 0,
			productsRemoved: body.productsRemoved ?? 0,
			linksAdded: body.linksAdded ?? 0,
			linksRemoved: body.linksRemoved ?? 0,
			errors: [],
		};
	}
	throw new SyncError(`Sincronização falhou após ${attempts} tentativas: ${last}`);
}
