import { afterEach, describe, expect, it, vi } from "vitest";
import { BuildError, buildDraft, topicOf } from "./build.ts";
import { FetchError, fetchLimited, isAllowedUrl } from "./fetch.ts";
import { FIXTURE_HTML, FIXTURE_URL } from "./fixture.ts";
import { clean, parsePostHtml } from "./parse.ts";
import { MISTRAL_MODELS, MISTRAL_URL, RewriteError, rewriteTexts } from "./rewrite.ts";

const HOSTS = ["eletrosinter.com.br"];
const options = { categories: ["cozinha", "limpeza"], date: "2026-10-06", maxProducts: 7 };

describe("parsePostHtml", () => {
	const scraped = parsePostHtml(FIXTURE_HTML, FIXTURE_URL);

	it("reads the headline, the section and every product card in page order", () => {
		expect(scraped.title).toBe("Melhor torradeira de teste: 9 opções para comprar");
		expect(scraped.section).toBe("cozinha");
		expect(scraped.summary).toBe("Resumo de exemplo que nunca deve ir para o rascunho.");
		expect(scraped.faq).toEqual([
			{
				question: "Pergunta de exemplo um?",
				answer: "Resposta de exemplo que nunca deve ir para o rascunho.",
			},
			{ question: "Pergunta de exemplo dois?", answer: "Outra resposta de exemplo." },
		]);
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

	it("keeps only the card's own spec sheet when the next card sits in another wrapper", () => {
		// Seen on real pages: the second card is wrapped, so the first card's siblings run into its sheet.
		const ficha = (power: string) =>
			`<div class="box-ficha-tecnica"><ul><li><strong>Potência:</strong> ${power}</li></ul></div>`;
		const card = (name: string) => `<div class="box-products"><div class="bp-title">${name}</div></div>`;
		const html = `<article><h1>Teste</h1>${card("A")}${ficha("100W")}<div>${card("B")}</div>${ficha("200W")}</article>`;
		const [first] = parsePostHtml(html, FIXTURE_URL).products;
		expect(first?.specs).toEqual([{ label: "Potência", value: "100W" }]);
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

	it("uses the rewritten description, intro and FAQ when there are any", () => {
		const rewritten = {
			description: "Descrição reescrita.",
			intro: ["Primeiro parágrafo reescrito.", "Segundo parágrafo reescrito."],
			faq: [{ question: "Pergunta reescrita?", answer: "Resposta reescrita." }],
		};
		const withText = buildDraft(scraped, { ...options, rewritten });
		expect(withText.post.description).toBe("Descrição reescrita.");
		expect(withText.post.faqData).toEqual(rewritten.faq);
		expect(withText.post.body.startsWith("Primeiro parágrafo reescrito.\n\nSegundo")).toBe(true);
		expect(withText.post.body).toContain("### Pergunta reescrita?\n\nResposta reescrita.");
		expect(withText.products).toEqual(draft.products);
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

describe("rewriteTexts", () => {
	afterEach(() => vi.unstubAllGlobals());

	const scraped = parsePostHtml(FIXTURE_HTML, FIXTURE_URL);
	const reply = (content: unknown, status = 200) =>
		vi.fn(async (_url: string, _init?: RequestInit) =>
			Response.json({ choices: [{ message: { content: JSON.stringify(content) } }] }, { status }),
		);

	it("sends the source summary and FAQ to Mistral and returns the cleaned rewrite", async () => {
		const fetchMock = reply({
			description: "Descrição {com} chaves",
			intro: ["Parágrafo <b>novo</b>."],
			faq: [{ question: "Pergunta nova?", answer: "Resposta nova." }],
		});
		vi.stubGlobal("fetch", fetchMock);

		const result = await rewriteTexts(scraped, "torradeira", "test-key");

		expect(result).toEqual({
			description: "Descrição com chaves",
			intro: ["Parágrafo bnovo/b."],
			faq: [{ question: "Pergunta nova?", answer: "Resposta nova." }],
		});
		const [url, init] = fetchMock.mock.calls[0] ?? [];
		expect(url).toBe(MISTRAL_URL);
		expect(new Headers(init?.headers).get("authorization")).toBe("Bearer test-key");
		const sent = JSON.stringify(JSON.parse(String(init?.body)).messages);
		expect(sent).toContain("Resumo de exemplo");
		expect(sent).toContain("Pergunta de exemplo dois?");
	});

	it("falls back to the next model when the plan has no quota for the first", async () => {
		const answer = { description: "Descrição", intro: ["Parágrafo."], faq: [] };
		const models: string[] = [];
		vi.stubGlobal("fetch", async (_url: string, init?: RequestInit) => {
			models.push(JSON.parse(String(init?.body)).model);
			return models.length === 1
				? Response.json({ message: "Rate limit exceeded" }, { status: 429 })
				: Response.json({ choices: [{ message: { content: JSON.stringify(answer) } }] });
		});

		expect(await rewriteTexts(scraped, "torradeira", "test-key")).toEqual(answer);
		expect(models).toEqual(MISTRAL_MODELS);
	});

	it("fails with a message for the editor on an error status or an unexpected answer", async () => {
		vi.stubGlobal("fetch", reply({}, 429));
		await expect(rewriteTexts(scraped, "t", "k")).rejects.toThrow(/429/);

		vi.stubGlobal("fetch", reply({ description: "só isso" }));
		await expect(rewriteTexts(scraped, "t", "k")).rejects.toThrow(RewriteError);
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
