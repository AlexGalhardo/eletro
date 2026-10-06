import { rm } from "node:fs/promises";
import { afterAll, describe, expect, it, vi } from "vitest";
import { rateLimit } from "../../src/lib/server/api.ts";
import { openApiDocument } from "../../src/lib/server/openapi.ts";
import * as categories from "../../src/routes/api/v1/categories/+server.ts";
import * as health from "../../src/routes/api/v1/health/+server.ts";
import * as media from "../../src/routes/api/v1/media/+server.ts";
import * as openapi from "../../src/routes/api/v1/openapi.json/+server.ts";
import * as posts from "../../src/routes/api/v1/posts/+server.ts";
import * as post from "../../src/routes/api/v1/posts/[slug]/+server.ts";
import * as products from "../../src/routes/api/v1/products/+server.ts";
import * as productList from "../../src/routes/api/v1/products/[list]/+server.ts";

// Writes go to a scratch folder; reads come from the real content bundled from the repository.
const root = await vi.hoisted(async () => {
	const { mkdtemp } = await import("node:fs/promises");
	const { tmpdir } = await import("node:os");
	const path = await import("node:path");
	return mkdtemp(path.join(tmpdir(), "api-"));
});

vi.mock("$app/env/private", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv({ CONTENT_ROOT: root });
});

afterAll(() => rm(root, { recursive: true, force: true }));

type Handler = (event: never) => Response | Promise<Response>;
type Options = {
	method?: string;
	body?: unknown;
	form?: FormData;
	params?: Record<string, string>;
	signedIn?: boolean;
};

const admin = { id: "1", name: "Admin", email: "admin@example.com", githubLogin: "admin" };

/** Calls a route handler the way SvelteKit would, with only the parts of the event the API uses. */
async function call(handler: Handler, path: string, options: Options = {}) {
	const { method = "GET", body, form, params = {}, signedIn = false } = options;
	const url = new URL(path, "http://localhost");
	const request = new Request(url, {
		method,
		body: form ?? (body === undefined ? undefined : JSON.stringify(body)),
		headers: body === undefined ? undefined : { "content-type": "application/json" },
	});
	const response = await handler({
		url,
		request,
		params,
		locals: { admin: signedIn ? admin : null },
	} as never);
	const text = await response.text();
	return { status: response.status, json: text ? JSON.parse(text) : undefined };
}

const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);
const upload = (bytes: Uint8Array, folder: string, name = "Foto Nova.png") => {
	const form = new FormData();
	form.set("file", new File([bytes as BlobPart], name, { type: "image/png" }));
	form.set("folder", folder);
	return form;
};

const product = {
	id: "p1",
	name: "Produto Um",
	image: "https://example.com/p1.jpg",
	mercadolivreUrl: "https://meli.la/x",
};
const draft = {
	title: "Melhor Cafeteira",
	description: "Resumo",
	date: "2026-01-10",
	category: "cozinha",
	body: 'Abertura.\n\n<CardsTable list="cafeteiras-teste" />',
};

describe("public reads", () => {
	it("reports health", async () => {
		const { status, json } = await call(health.GET, "/api/v1/health");

		expect(status).toBe(200);
		expect(json.data).toEqual({ status: "ok", version: expect.stringMatching(/^\d+\.\d+\.\d+/) });
	});

	it("lists published posts in pages, newest first", async () => {
		const first = await call(posts.GET, "/api/v1/posts");
		const second = await call(posts.GET, "/api/v1/posts?page=2&pageSize=5");

		expect(first.status).toBe(200);
		expect(first.json.data).toHaveLength(20);
		expect(first.json.pagination).toMatchObject({ page: 1, pageSize: 20 });
		expect(first.json.pagination.totalItems).toBeGreaterThanOrEqual(64);
		expect(first.json.data[0].date >= first.json.data[19].date).toBe(true);
		expect(second.json.data).toHaveLength(5);
		expect(second.json.data[0].slug).toBe(first.json.data[5].slug);
	});

	it("filters posts by category and by text, ignoring accents", async () => {
		const byCategory = await call(posts.GET, "/api/v1/posts?category=moveis&pageSize=100");
		const byText = await call(posts.GET, "/api/v1/posts?q=SOFA&pageSize=100");

		expect(byCategory.json.data.length).toBeGreaterThan(0);
		expect(byCategory.json.data.every((item: { category: string }) => item.category === "moveis")).toBe(
			true,
		);
		expect(byText.json.data.length).toBeGreaterThan(0);
		expect(
			byText.json.data.every((item: { title: string; description: string }) =>
				/sof[aá]/i.test(`${item.title} ${item.description}`),
			),
		).toBe(true);
	});

	it("refuses an invalid page with the single error format", async () => {
		const { status, json } = await call(posts.GET, "/api/v1/posts?page=0");

		expect(status).toBe(400);
		expect(json.error).toMatchObject({
			code: "invalid_request",
			details: [expect.stringContaining("page")],
		});
	});

	it("returns a post with its body, and 404 for an unknown slug", async () => {
		const slug = "melhor-airfryer-8-litros";
		const found = await call(post.GET, `/api/v1/posts/${slug}`, { params: { slug } });
		const missing = await call(post.GET, "/api/v1/posts/nao-existe", { params: { slug: "nao-existe" } });

		expect(found.status).toBe(200);
		expect(found.json.data).toMatchObject({ slug, body: expect.stringContaining("<CardsTable") });
		expect(missing.status).toBe(404);
		expect(missing.json.error.code).toBe("not_found");
	});

	it("lists categories with their post counts", async () => {
		const { status, json } = await call(categories.GET, "/api/v1/categories");
		const total = (await call(posts.GET, "/api/v1/posts")).json.pagination.totalItems;

		expect(status).toBe(200);
		expect(json.data.reduce((sum: number, category: { posts: number }) => sum + category.posts, 0)).toBe(
			total,
		);
	});

	it("lists product lists and returns one, or 404", async () => {
		const names = await call(products.GET, "/api/v1/products");
		const list = names.json.data[0];
		const found = await call(productList.GET, `/api/v1/products/${list}`, { params: { list } });
		const missing = await call(productList.GET, "/api/v1/products/nao-existe", {
			params: { list: "nao-existe" },
		});

		expect(names.json.data.length).toBeGreaterThanOrEqual(69);
		expect(found.status).toBe(200);
		expect(found.json.data.products[0]).toMatchObject({
			id: expect.any(String),
			name: expect.any(String),
		});
		expect(missing.status).toBe(404);
	});
});

describe("writes", () => {
	it.each([
		["POST /posts", posts.POST, "/api/v1/posts", { method: "POST", body: {} }],
		[
			"PUT /posts/{slug}",
			post.PUT,
			"/api/v1/posts/x",
			{ method: "PUT", body: {}, params: { slug: "abc" } },
		],
		[
			"DELETE /posts/{slug}",
			post.DELETE,
			"/api/v1/posts/x?sha=1",
			{ method: "DELETE", params: { slug: "abc" } },
		],
		["POST /products", products.POST, "/api/v1/products", { method: "POST", body: {} }],
		[
			"PUT /products/{list}",
			productList.PUT,
			"/api/v1/products/x",
			{ method: "PUT", body: {}, params: { list: "abc" } },
		],
		["GET /media", media.GET, "/api/v1/media?folder=covers", {}],
		["POST /media", media.POST, "/api/v1/media", { method: "POST", form: upload(PNG, "covers") }],
	] as [string, Handler, string, Options][])(
		"%s answers 401 without an admin session",
		async (_, handler, path, options) => {
			const { status, json } = await call(handler, path, options);

			expect(status).toBe(401);
			expect(json.error.code).toBe("unauthorized");
		},
	);

	it("creates and replaces a product list, refusing duplicates, bad data and stale versions", async () => {
		const url = "/api/v1/products";
		const params = { list: "cafeteiras-teste" };
		const create = {
			method: "POST",
			signedIn: true,
			body: { name: "cafeteiras-teste", products: [product] },
		};

		const created = await call(products.POST, url, create);
		expect(created.status).toBe(201);
		expect(created.json.data).toEqual({ name: "cafeteiras-teste", sha: expect.any(String) });

		expect((await call(products.POST, url, create)).status).toBe(409);
		expect(
			(await call(products.POST, url, { ...create, body: { name: "outra-lista", products: [] } }))
				.status,
		).toBe(400);
		expect(
			(
				await call(products.POST, url, {
					...create,
					body: { name: "Nome Inválido", products: [product] },
				})
			).status,
		).toBe(400);

		const put = (sha: unknown) =>
			call(productList.PUT, `${url}/cafeteiras-teste`, {
				method: "PUT",
				signedIn: true,
				params,
				body: { sha, products: [product, { ...product, id: "p2" }] },
			});
		expect((await put(undefined)).status).toBe(400);
		expect((await put("stale")).status).toBe(409);
		expect((await put(created.json.data.sha)).status).toBe(200);
	});

	it("runs the whole life of a post: create, conflict, update and delete", async () => {
		const params = { slug: "melhor-cafeteira-teste" };
		const signedIn = true;

		const invalid = await call(posts.POST, "/api/v1/posts", {
			method: "POST",
			signedIn,
			body: { slug: params.slug, ...draft, body: "<script>alert(1)</script>" },
		});
		expect(invalid.status).toBe(400);
		expect(invalid.json.error).toMatchObject({ code: "validation_failed", details: expect.any(Array) });

		const create = { method: "POST", signedIn, body: { slug: params.slug, ...draft } };
		const created = await call(posts.POST, "/api/v1/posts", create);
		expect(created.status).toBe(201);
		expect((await call(posts.POST, "/api/v1/posts", create)).status).toBe(409);

		const put = (body: unknown, slug = params.slug) =>
			call(post.PUT, `/api/v1/posts/${slug}`, { method: "PUT", signedIn, params: { slug }, body });
		expect((await put(draft)).status).toBe(400);
		expect((await put({ ...draft, sha: "x" }, "post-que-nao-existe")).status).toBe(404);
		expect((await put({ ...draft, sha: "stale" })).status).toBe(409);

		const updated = await put({ ...draft, title: "Título Novo", sha: created.json.data.sha });
		expect(updated.status).toBe(200);
		expect(updated.json.data.sha).not.toBe(created.json.data.sha);

		const remove = (query: string, slug = params.slug) =>
			call(post.DELETE, `/api/v1/posts/${slug}${query}`, {
				method: "DELETE",
				signedIn,
				params: { slug },
			});
		expect((await remove("")).status).toBe(400);
		expect((await remove("?sha=x", "post-que-nao-existe")).status).toBe(404);
		expect((await remove(`?sha=${created.json.data.sha}`)).status).toBe(409);
		expect((await remove(`?sha=${updated.json.data.sha}`)).status).toBe(204);
		expect((await remove(`?sha=${updated.json.data.sha}`)).status).toBe(404);
	});

	it("uploads an image, lists it, and refuses what is not an image or goes to an unknown folder", async () => {
		const send = (form: FormData) =>
			call(media.POST, "/api/v1/media", { method: "POST", signedIn: true, form });

		const uploaded = await send(upload(PNG, "covers"));
		expect(uploaded.status).toBe(201);
		expect(uploaded.json.data).toEqual({ url: "/images/covers/foto-nova.png" });

		const listed = await call(media.GET, "/api/v1/media?folder=covers", { signedIn: true });
		expect(listed.json.data).toEqual(["/images/covers/foto-nova.png"]);

		expect((await send(upload(new TextEncoder().encode("<svg/>"), "covers"))).status).toBe(400);
		expect((await send(upload(PNG, "../secrets"))).status).toBe(400);
		expect((await send(new FormData())).status).toBe(400);
		expect((await call(media.GET, "/api/v1/media?folder=avatars", { signedIn: true })).status).toBe(400);
	});
});

describe("openapi.json", () => {
	const routes = import.meta.glob<Record<string, unknown>>("../../src/routes/api/v1/**/+server.ts", {
		eager: true,
	});
	const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE"];

	it("is served as an OpenAPI 3.1 document", async () => {
		const { status, json } = await call(openapi.GET, "/api/v1/openapi.json");

		expect(status).toBe(200);
		expect(json).toMatchObject({
			openapi: "3.1.0",
			info: { title: expect.any(String), version: expect.any(String) },
		});
	});

	it("describes exactly the operations the routes implement", () => {
		const implemented = Object.entries(routes).flatMap(([file, module]) => {
			const path = file
				.replace(/^.*\/api\/v1/, "")
				.replace(/\/\+server\.ts$/, "")
				.replace(/\[(\w+)\]/g, "{$1}");
			return METHODS.filter((method) => method in module).map((method) => `${method} ${path}`);
		});

		const paths = openApiDocument("0.0.0").paths as Record<string, Record<string, unknown>>;
		const documented = Object.entries(paths).flatMap(([path, item]) =>
			METHODS.filter((method) => method.toLowerCase() in item).map((method) => `${method} ${path}`),
		);

		expect(documented.sort()).toEqual(implemented.sort());
	});

	it("resolves every $ref and gives every operation a summary and responses", () => {
		const document = openApiDocument("0.0.0");
		const text = JSON.stringify(document);
		const schemas = (document.components as { schemas: Record<string, unknown> }).schemas;

		for (const [, name] of text.matchAll(/"#\/components\/schemas\/(\w+)"/g))
			expect(schemas).toHaveProperty(name as string);
		for (const item of Object.values(document.paths as Record<string, Record<string, unknown>>)) {
			for (const method of METHODS.map((name) => name.toLowerCase()).filter((name) => name in item)) {
				expect(item[method]).toMatchObject({
					summary: expect.any(String),
					responses: expect.any(Object),
				});
			}
		}
	});
});

describe("rate limit", () => {
	it("lets `limit` requests through per window and tells how long to wait after that", () => {
		const key = "rate-limit-test";

		expect([1, 2, 3].map(() => rateLimit(key, 3, 60_000, 1000))).toEqual([0, 0, 0]);
		expect(rateLimit(key, 3, 60_000, 31_000)).toBe(30);
		expect(rateLimit(key, 3, 60_000, 61_000)).toBe(0);
	});
});
