import { describe, expect, test } from "vitest";
import { catalogueProblems } from "../affiliate-links.ts";
import { site } from "../site.config.ts";
import {
	buildCatalogue,
	FALLBACK_EXTERNAL_ID,
	fallbackHref,
	productExternalId,
	productHref,
} from "./affiliate.ts";
import type { Product } from "./schema.ts";

const product = (id: string, urls: Partial<Product> = {}): Product => ({
	id,
	name: `Produto ${id}`,
	image: "#",
	advantages: [],
	technicalDetails: [],
	...urls,
});

const post = (slug: string, ...lists: string[]) => ({
	post: { slug },
	body: lists.map((list) => `<CardsTable list="${list}" />`).join("\n\ntexto\n\n"),
});

describe("buildCatalogue", () => {
	test("registers each product of a published post under <site>/<post>/<product>", () => {
		const lists = new Map([
			["fritadeiras", [product("arno", { mercadolivreUrl: "https://meli.la/arno" })]],
		]);
		const [entry] = buildCatalogue([post("melhor-airfryer", "fritadeiras")], lists);
		expect(entry).toEqual({
			externalId: `${site.url}/melhor-airfryer/arno`,
			name: "Produto arno",
			pageUrl: `${site.url}/melhor-airfryer`,
			category: "melhor-airfryer",
			links: [{ url: "https://meli.la/arno", store: "mercadolivre" }],
		});
	});

	test("uses the post slug, not the list name, and one link per store with a real address", () => {
		const lists = new Map([
			[
				"lista-com-outro-nome",
				[
					product("a", {
						mercadolivreUrl: "#",
						shopeeUrl: "https://s.shopee.com.br/a",
						amazonUrl: "https://amzn.to/a",
					}),
				],
			],
		]);
		const [entry] = buildCatalogue([post("meu-post", "lista-com-outro-nome")], lists);
		expect(entry?.externalId).toBe(`${site.url}/meu-post/a`);
		expect(entry?.links.map((link) => link.store)).toEqual(["amazon", "shopee"]);
	});

	test("leaves out products without a real link, lists no post shows and missing lists", () => {
		const lists = new Map([
			["usada", [product("com-link", { mercadolivreUrl: "https://meli.la/x" }), product("sem-link")]],
			["orfa", [product("orfao", { mercadolivreUrl: "https://meli.la/y" })]],
		]);
		const ids = buildCatalogue([post("p", "usada", "nao-existe")], lists).map(
			(entry) => entry.externalId,
		);
		expect(ids).toEqual([`${site.url}/p/com-link`, FALLBACK_EXTERNAL_ID]);
	});

	test("always ends with the site fallback offer, even without posts", () => {
		expect(buildCatalogue([], new Map())).toEqual([
			{
				externalId: FALLBACK_EXTERNAL_ID,
				name: `${site.name}: ofertas`,
				pageUrl: site.url,
				links: [{ url: site.fallbackAffiliateUrl, store: "mercadolivre" }],
			},
		]);
	});

	test("the same product id in two posts gives two distinct ids; twice in one post is a problem", () => {
		const lists = new Map([
			["a", [product("x", { mercadolivreUrl: "https://meli.la/1" })]],
			["b", [product("x", { mercadolivreUrl: "https://meli.la/2" })]],
		]);
		expect(catalogueProblems(buildCatalogue([post("p1", "a"), post("p2", "b")], lists))).toEqual([]);
		expect(catalogueProblems(buildCatalogue([post("p1", "a", "b")], lists))).toEqual([
			`${site.url}/p1/x: id repetido`,
		]);
	});
});

describe("hrefs", () => {
	test("a button points to the dashboard redirect with the registered id and the store", () => {
		const href = new URL(productHref("melhor-airfryer", "arno", "shopee"));
		expect(href.origin).toBe(site.linksDashboardUrl);
		expect(href.pathname).toBe("/link");
		expect(href.searchParams.get("id")).toBe(productExternalId("melhor-airfryer", "arno"));
		expect(href.searchParams.get("store")).toBe("shopee");
	});

	test("the fallback href points to the registered fallback", () => {
		const href = new URL(fallbackHref);
		expect(href.origin).toBe(site.linksDashboardUrl);
		expect(href.searchParams.get("id")).toBe(FALLBACK_EXTERNAL_ID);
	});
});
