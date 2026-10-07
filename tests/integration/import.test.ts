import { readdir, readFile, rm } from "node:fs/promises";
import path from "node:path";
import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { parsePost } from "../../src/lib/content/parse.ts";
import { productListSchema } from "../../src/lib/content/schema.ts";
import { ValidationError } from "../../src/lib/server/cms.ts";
import { importPost } from "../../src/lib/server/post-import.ts";
import { createLocalStore } from "../../src/lib/server/store/local.ts";
import * as imports from "../../src/routes/api/v1/imports/+server.ts";
import { FIXTURE_HTML, FIXTURE_URL } from "../../webscrapping/fixture.ts";
import { MISTRAL_URL } from "../../webscrapping/rewrite.ts";

// The route writes through getStore(), which reads CONTENT_ROOT: a scratch folder, never the repository.
const root = await vi.hoisted(async () => {
	const { mkdtemp } = await import("node:fs/promises");
	const { tmpdir } = await import("node:os");
	const path = await import("node:path");
	return mkdtemp(path.join(tmpdir(), "import-"));
});

vi.mock("$app/env/private", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv({ CONTENT_ROOT: root });
});

afterAll(() => rm(root, { recursive: true, force: true }));

const author = { name: "Admin", email: "admin@example.com" };
const JPEG = new Uint8Array([0xff, 0xd8, 0xff, 0xe0, 1, 2, 3]);
const SLUG = "melhor-torradeira-de-teste";

/** The source site as the import sees it: one page and its product photos. Nothing here touches the network. */
function fakeSite(page = FIXTURE_HTML, mistral?: () => Response) {
	const calls: string[] = [];
	vi.stubGlobal("fetch", async (url: string) => {
		calls.push(url);
		if (url === MISTRAL_URL && mistral) return mistral();
		if (url === FIXTURE_URL) return new Response(page, { headers: { "content-type": "text/html" } });
		if (url.startsWith("https://m.media-amazon.com/")) return new Response(JPEG);
		return new Response("not found", { status: 404 });
	});
	return calls;
}

const files = async (folder: string) => (await readdir(path.join(root, folder)).catch(() => [])).sort();

beforeEach(() => rm(root, { recursive: true, force: true }));
afterEach(() => vi.unstubAllGlobals());

describe("importPost", () => {
	it("stores the photos, the product list and a draft post built from the scraped facts", async () => {
		const calls = fakeSite();

		const result = await importPost(createLocalStore(root), FIXTURE_URL, author, new Date("2026-10-06"));

		expect(result).toMatchObject({ slug: SLUG, list: SLUG, products: 7, source: FIXTURE_URL });
		expect(result.rewritten).toBe(false);
		expect(result.rewriteWarning).toMatch(/MISTRAL_API_KEY/);
		// One page plus the photos of the first seven products, and nothing else.
		expect(calls).toHaveLength(8);

		expect(await files("static/images/posts")).toEqual(
			[1, 2, 3, 4, 5, 6, 7].map((index) => `${SLUG}-${index}.jpg`),
		);

		const products = productListSchema.parse(
			JSON.parse(await readFile(path.join(root, `content/products/${SLUG}.json`), "utf8")),
		);
		expect(products).toHaveLength(7);
		expect(products[0]).toMatchObject({
			name: "Marca Um T100",
			image: `/images/posts/${SLUG}-1.jpg`,
			mercadolivreUrl: "#",
			shopeeUrl: "#",
			amazonUrl: "#",
		});

		const { post, body } = parsePost(
			SLUG,
			await readFile(path.join(root, `content/posts/${SLUG}.mdx`), "utf8"),
		);
		expect(post).toMatchObject({ draft: true, cover: "", category: "cozinha", ref: FIXTURE_URL });
		expect(body).toContain(`<CardsTable list="${SLUG}" />`);
		expect(body).not.toContain("nunca deve ir");
	});

	it("stores the summary and FAQ rewritten by Mistral when there is a key", async () => {
		const rewrite = {
			description: "Descrição reescrita pela IA.",
			intro: ["Introdução reescrita pela IA."],
			faq: [{ question: "Pergunta reescrita?", answer: "Resposta reescrita." }],
		};
		const calls = fakeSite(FIXTURE_HTML, () =>
			Response.json({ choices: [{ message: { content: JSON.stringify(rewrite) } }] }),
		);

		const result = await importPost(createLocalStore(root), FIXTURE_URL, author, new Date(), "key");

		expect(result).toMatchObject({ rewritten: true, products: 7 });
		expect(result.rewriteWarning).toBeUndefined();
		expect(calls.filter((url) => url === MISTRAL_URL)).toHaveLength(1);
		const { post, body } = parsePost(
			SLUG,
			await readFile(path.join(root, `content/posts/${SLUG}.mdx`), "utf8"),
		);
		expect(post).toMatchObject({ description: rewrite.description, faqData: rewrite.faq, draft: true });
		expect(body).toContain("Introdução reescrita pela IA.");
		expect(body).not.toContain("nunca deve ir");
	});

	it("keeps the template text and says why when Mistral fails", async () => {
		fakeSite(FIXTURE_HTML, () => new Response("rate limited", { status: 429 }));

		const result = await importPost(createLocalStore(root), FIXTURE_URL, author, new Date(), "key");

		expect(result).toMatchObject({ rewritten: false, products: 7 });
		expect(result.rewriteWarning).toMatch(/429/);
		expect(await files("content/posts")).toEqual([`${SLUG}.mdx`]);
	});

	it("refuses a second import of the same page before writing anything", async () => {
		fakeSite();
		const store = createLocalStore(root);
		await importPost(store, FIXTURE_URL, author);

		const calls = fakeSite();
		await expect(importPost(store, FIXTURE_URL, author)).rejects.toThrow(/Já existe/);
		expect(calls).toEqual([FIXTURE_URL]);
		expect(await files("static/images/posts")).toHaveLength(7);
	});

	it("refuses hosts outside the allow list without fetching", async () => {
		const calls = fakeSite();
		const store = createLocalStore(root);

		for (const url of ["https://example.com/cozinha/x/", "http://eletrosinter.com.br/cozinha/x/", "x"])
			await expect(importPost(store, url, author)).rejects.toThrow(ValidationError);
		expect(calls).toEqual([]);
	});

	it("refuses a product photo hosted outside the image allow list", async () => {
		fakeSite(FIXTURE_HTML.replaceAll("https://m.media-amazon.com/", "https://internal.example/"));

		await expect(importPost(createLocalStore(root), FIXTURE_URL, author)).rejects.toThrow(
			/não está em um endereço permitido/,
		);
		expect(await files("content/posts")).toEqual([]);
	});

	it("explains when the page has no products", async () => {
		fakeSite("<html><body><article><h1>Sem produtos</h1></article></body></html>");

		await expect(importPost(createLocalStore(root), FIXTURE_URL, author)).rejects.toThrow(
			/Nenhum produto/,
		);
	});
});

describe("POST /api/v1/imports", () => {
	const call = async (body: unknown, signedIn: boolean) => {
		const request = new Request("http://localhost/api/v1/imports", {
			method: "POST",
			body: JSON.stringify(body),
			headers: { "content-type": "application/json" },
		});
		const admin = { id: "1", name: "Admin", email: "admin@example.com", githubLogin: "admin" };
		const response = await imports.POST({ request, locals: { admin: signedIn ? admin : null } } as never);
		return { status: response.status, json: await response.json() };
	};

	it("needs an admin session", async () => {
		const calls = fakeSite();

		expect((await call({ url: FIXTURE_URL }, false)).status).toBe(401);
		expect(calls).toEqual([]);
	});

	it("creates the draft and answers with its slug", async () => {
		fakeSite();

		const { status, json } = await call({ url: FIXTURE_URL }, true);

		expect(status).toBe(201);
		expect(json.data).toMatchObject({ slug: SLUG, products: 7 });
		expect(await files("content/posts")).toEqual([`${SLUG}.mdx`]);
	});

	it("answers 400 with a message for the editor when the URL is not allowed", async () => {
		fakeSite();

		const { status, json } = await call({ url: "https://example.com/x" }, true);

		expect(status).toBe(400);
		expect(json.error).toMatchObject({
			code: "validation_failed",
			details: [expect.stringContaining("https")],
		});
	});
});
