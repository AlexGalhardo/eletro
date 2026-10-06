import { afterEach, describe, expect, it, vi } from "vitest";
import { BuildError, buildDraft, topicOf } from "./build.ts";
import { FetchError, fetchLimited, isAllowedUrl } from "./fetch.ts";
import { FIXTURE_HTML, FIXTURE_URL } from "./fixture.ts";
import { clean, parsePostHtml } from "./parse.ts";

const HOSTS = ["eletrosinter.com.br"];
const options = { categories: ["cozinha", "limpeza"], date: "2026-10-06", maxProducts: 7 };

describe("parsePostHtml", () => {
	const scraped = parsePostHtml(FIXTURE_HTML, FIXTURE_URL);

	it("reads the headline, the section and every product card in page order", () => {
		expect(scraped.title).toBe("Melhor torradeira de teste: 9 opções para comprar");
		expect(scraped.section).toBe("cozinha");
		expect(scraped.faqCount).toBe(2);
		expect(scraped.products).toHaveLength(9);
		expect(scraped.products.map((product) => product.name).slice(0, 2)).toEqual([
			"Marca Um T100",
			"Marca 2 T200",
		]);
	});

	it("reads image, pros, cons and specs of each product without mixing neighbours", () => {
		expect(scraped.products[0]).toEqual({
			name: "Marca Um T100",
			image: "https://m.media-amazon.com/images/I/photo-1._SS500_.jpg",
			pros: ["Vantagem de exemplo 1", "Outra vantagem"],
			cons: ["Desvantagem de exemplo 1"],
			specs: [
				{ label: "Potência", value: "700W" },
				{ label: "Capacidade", value: "2 fatias" },
				{ label: "Dimensões (A x L x P)", value: "18 x 20 x 30cm" },
			],
		});
	});

	it("strips what mdsvex would read as code", () => {
		expect(scraped.products[1]?.specs.at(-1)).toEqual({
			label: "Observação",
			value: "valor com chaves e",
		});
		expect(clean("  a {b} <c>  d ")).toBe("a b c d");
	});

	it("returns no products for a page with another layout", () => {
		expect(
			parsePostHtml("<html><body><h1>Outra página</h1></body></html>", FIXTURE_URL).products,
		).toEqual([]);
	});
});

describe("buildDraft", () => {
	const scraped = parsePostHtml(FIXTURE_HTML, FIXTURE_URL);
	const draft = buildDraft(scraped, options);

	it("keeps only the first products, as placeholders for the admin to finish", () => {
		expect(draft.products).toHaveLength(7);
		expect(draft.products[0]).toMatchObject({
			id: "marca-um-t100",
			name: "Marca Um T100",
			mercadolivreUrl: "#",
			shopeeUrl: "#",
			amazonUrl: "#",
			technicalDetails: scraped.products[0]?.specs,
		});
		expect(new Set(draft.products.map((product) => product.id)).size).toBe(7);
	});

	it("creates a draft post without cover that points to the list and to the source", () => {
		expect(draft.slug).toBe("melhor-torradeira-de-teste");
		expect(draft.list).toBe(draft.slug);
		expect(draft.post).toMatchObject({
			title: "Melhor Torradeira de Teste: 7 Modelos em 2026",
			date: "2026-10-06",
			category: "cozinha",
			cover: "",
			draft: true,
			ref: FIXTURE_URL,
		});
		expect(draft.post.body).toContain('<CardsTable list="melhor-torradeira-de-teste" />');
		expect(draft.post.body).toContain("## Perguntas Frequentes");
		expect(draft.post.body).not.toMatch(/[{}]/);
		expect(draft.post.faqData.length).toBeGreaterThanOrEqual(2);
	});

	it("never copies the prose of the source", () => {
		const text = JSON.stringify(draft);
		for (const prose of ["nunca deve ir", "Vantagem de exemplo", "Desvantagem", "Pergunta de exemplo"])
			expect(text).not.toContain(prose);
	});

	it("refuses a page without products or from a category the site does not have", () => {
		expect(() => buildDraft({ ...scraped, products: [] }, options)).toThrow(BuildError);
		expect(() => buildDraft({ ...scraped, section: "jardim" }, options)).toThrow(/jardim/);
	});

	it("derives the topic from the headline, or from the URL when the headline is not a ranking", () => {
		expect(topicOf({ title: "Qual o melhor mop? Veja 8 opções", url: FIXTURE_URL })).toBe("mop");
		expect(
			topicOf({ title: "Um título longo demais que não segue o padrão de ranking", url: FIXTURE_URL }),
		).toBe("torradeira de teste");
	});
});

describe("fetchLimited", () => {
	afterEach(() => vi.unstubAllGlobals());

	const stubFetch = (handler: (url: string) => Response) => {
		const calls: string[] = [];
		vi.stubGlobal("fetch", async (url: string) => {
			calls.push(url);
			return handler(url);
		});
		return calls;
	};

	it("accepts only https URLs of listed hosts, without port or credentials", () => {
		expect(isAllowedUrl("https://eletrosinter.com.br/cozinha/x/", HOSTS)).toBe(true);
		for (const url of [
			"http://eletrosinter.com.br/x",
			"https://eletrosinter.com.br:8443/x",
			"https://user:pass@eletrosinter.com.br/x",
			"https://eletrosinter.com.br.evil.example/x",
			"https://sub.eletrosinter.com.br/x",
			"https://169.254.169.254/latest/meta-data",
			"file:///etc/passwd",
			"not a url",
		])
			expect(isAllowedUrl(url, HOSTS), url).toBe(false);
	});

	it("does not call fetch for a host outside the list", async () => {
		const calls = stubFetch(() => new Response("x"));
		await expect(
			fetchLimited("https://localhost/x", { allowedHosts: HOSTS, maxBytes: 10 }),
		).rejects.toThrow(FetchError);
		expect(calls).toEqual([]);
	});

	it("follows a redirect inside the list and refuses one that leaves it", async () => {
		const redirect = (location: string) => new Response(null, { status: 302, headers: { location } });
		stubFetch((url) => (url.endsWith("/a") ? redirect("/b") : new Response("ok")));
		const bytes = await fetchLimited("https://eletrosinter.com.br/a", {
			allowedHosts: HOSTS,
			maxBytes: 10,
		});
		expect(new TextDecoder().decode(bytes)).toBe("ok");

		const calls = stubFetch(() => redirect("https://internal.example/secret"));
		await expect(
			fetchLimited("https://eletrosinter.com.br/a", { allowedHosts: HOSTS, maxBytes: 10 }),
		).rejects.toThrow(/não permitido/);
		expect(calls).toEqual(["https://eletrosinter.com.br/a"]);
	});

	it("stops at the size cap and reports an error status", async () => {
		stubFetch(() => new Response("x".repeat(50)));
		await expect(
			fetchLimited("https://eletrosinter.com.br/a", { allowedHosts: HOSTS, maxBytes: 10 }),
		).rejects.toThrow(/limite/);

		stubFetch(() => new Response("no", { status: 403 }));
		await expect(
			fetchLimited("https://eletrosinter.com.br/a", { allowedHosts: HOSTS, maxBytes: 10 }),
		).rejects.toThrow(/403/);
	});
});
