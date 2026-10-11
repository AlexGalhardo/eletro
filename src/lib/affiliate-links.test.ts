import { describe, expect, test } from "vitest";
import {
	affiliateHref,
	type CatalogueProduct,
	catalogueProblems,
	isAffiliateUrl,
	SyncError,
	storeLinks,
	syncCatalogue,
} from "./affiliate-links.ts";

const product = (id: string, links = 1): CatalogueProduct => ({
	externalId: `https://site.example.com/cat/${id}`,
	links: Array.from({ length: links }, () => ({ url: "https://amzn.to/x", store: "amazon" as const })),
});

const SUMMARY = {
	productsCreated: 1,
	productsUpdated: 0,
	productsRemoved: 0,
	linksAdded: 1,
	linksRemoved: 0,
	errors: [],
};

/** A fetch that answers from a queue (a Response, or an Error to throw) and records every call. */
function fakeFetch(answers: (Response | Error)[]): {
	fetch: typeof fetch;
	calls: { url: string; init: RequestInit }[];
} {
	const calls: { url: string; init: RequestInit }[] = [];
	const impl = async (url: RequestInfo | URL, init?: RequestInit): Promise<Response> => {
		calls.push({ url: String(url), init: init ?? {} });
		const answer = answers.shift();
		if (!answer) throw new Error("no answer queued");
		if (answer instanceof Error) throw answer;
		return answer;
	};
	return { fetch: impl as typeof fetch, calls };
}

const json = (status: number, body: unknown): Response => new Response(JSON.stringify(body), { status });
const options = { dashboardUrl: "https://links.example.com/", token: "la_test", retryDelayMs: 0 };

describe("isAffiliateUrl and storeLinks", () => {
	test("only an https address is a link: placeholders are ignored", () => {
		for (const value of ["#", "", " ", null, undefined, "http://amzn.to/x", "amzn.to/x", 42])
			expect(isAffiliateUrl(value)).toBe(false);
		expect(isAffiliateUrl("https://amzn.to/x")).toBe(true);
	});

	test("one link per store that has a real address, in a fixed order", () => {
		expect(
			storeLinks({
				shopeeUrl: "https://s.shopee.com.br/a",
				mercadolivreUrl: "https://meli.la/a",
				amazonUrl: "#",
			}),
		).toEqual([
			{ url: "https://meli.la/a", store: "mercadolivre" },
			{ url: "https://s.shopee.com.br/a", store: "shopee" },
		]);
		expect(storeLinks({ mercadolivreUrl: null })).toEqual([]);
	});
});

describe("affiliateHref", () => {
	test("points to the dashboard redirect with the id encoded and the store", () => {
		expect(
			affiliateHref("https://links.example.com/", "https://site.example.com/cat/a b&c", "shopee"),
		).toBe(
			"https://links.example.com/link?id=https%3A%2F%2Fsite.example.com%2Fcat%2Fa%20b%26c&store=shopee",
		);
	});
});

describe("catalogueProblems", () => {
	test("reports repeated ids and products without links", () => {
		expect(catalogueProblems([product("a"), product("b")])).toEqual([]);
		expect(catalogueProblems([product("a"), product("a"), product("c", 0)])).toEqual([
			"https://site.example.com/cat/a: id repetido",
			"https://site.example.com/cat/c: sem link de afiliado",
		]);
	});
});

describe("syncCatalogue", () => {
	test("sends the whole catalogue with PUT and the project token", async () => {
		const { fetch, calls } = fakeFetch([json(200, SUMMARY)]);
		const products = [product("a")];
		expect(await syncCatalogue({ ...options, products, fetch })).toEqual(SUMMARY);
		expect(calls).toHaveLength(1);
		expect(calls[0]?.url).toBe("https://links.example.com/api/v1/links");
		expect(calls[0]?.init.method).toBe("PUT");
		expect(new Headers(calls[0]?.init.headers).get("authorization")).toBe("Bearer la_test");
		expect(JSON.parse(String(calls[0]?.init.body))).toEqual(products);
	});

	test("never calls the dashboard with an empty or invalid catalogue", async () => {
		const { fetch, calls } = fakeFetch([]);
		await expect(syncCatalogue({ ...options, products: [], fetch })).rejects.toThrow(SyncError);
		await expect(
			syncCatalogue({ ...options, products: [product("a"), product("a")], fetch }),
		).rejects.toThrow("id repetido");
		await expect(syncCatalogue({ ...options, products: [product("a", 0)], fetch })).rejects.toThrow(
			"sem link de afiliado",
		);
		expect(calls).toHaveLength(0);
	});

	test("retries a network failure and a 5xx, then succeeds", async () => {
		const { fetch, calls } = fakeFetch([
			new TypeError("fetch failed"),
			json(503, {}),
			json(200, SUMMARY),
		]);
		expect(await syncCatalogue({ ...options, products: [product("a")], fetch })).toEqual(SUMMARY);
		expect(calls).toHaveLength(3);
	});

	test("gives up after the configured attempts when the dashboard stays down", async () => {
		const { fetch, calls } = fakeFetch([json(500, {}), new DOMException("timed out", "TimeoutError")]);
		await expect(
			syncCatalogue({ ...options, products: [product("a")], fetch, attempts: 2 }),
		).rejects.toThrow("após 2 tentativas");
		expect(calls).toHaveLength(2);
	});

	test("does not retry what a retry cannot fix: 401, 409, 207, 400", async () => {
		const cases: [Response, string][] = [
			[json(401, { error: "unauthorized" }), "401"],
			[json(409, { error: "project_offline" }), "project_offline"],
			[json(207, { ...SUMMARY, errors: ["x: pertence a outro projeto"] }), "pertence a outro projeto"],
			[json(400, { error: "invalid_body" }), "400 invalid_body"],
			[new Response("<html>", { status: 200 }), "Resposta inesperada"],
		];
		for (const [response, message] of cases) {
			const { fetch, calls } = fakeFetch([response]);
			await expect(syncCatalogue({ ...options, products: [product("a")], fetch })).rejects.toThrow(
				message,
			);
			expect(calls).toHaveLength(1);
		}
	});
});
