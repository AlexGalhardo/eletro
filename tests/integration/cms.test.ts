import { mkdtemp, readFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { validateBody } from "../../src/lib/content/validate-body.ts";
import {
	deletePost,
	deleteProductList,
	getPost,
	getProductList,
	listImages,
	listPosts,
	listUsage,
	savePost,
	saveProductList,
	slugifyFilename,
	uploadImage,
	ValidationError,
} from "../../src/lib/server/cms.ts";
import { createGitHubStore } from "../../src/lib/server/store/github.ts";
import { createLocalStore } from "../../src/lib/server/store/local.ts";
import {
	blobSha,
	ConflictError,
	type ContentStore,
	encode,
	StoreFailedError,
	StoreUnavailableError,
} from "../../src/lib/server/store/types.ts";

const author = { name: "Admin", email: "admin@example.com" };
const product = {
	id: "p1",
	name: "Produto Um",
	image: "https://example.com/p1.jpg",
	mercadolivreUrl: "https://meli.la/x",
};
const post = {
	title: "Melhor Cafeteira",
	description: "Resumo",
	date: "2026-01-10",
	category: "cozinha",
	body: 'Abertura.\n\n<CardsTable list="cafeteiras" />',
};
const PNG = new Uint8Array([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, 1, 2, 3]);

let root: string;
let store: ContentStore;

beforeEach(async () => {
	root = await mkdtemp(path.join(tmpdir(), "cms-"));
	store = createLocalStore(root);
});
afterEach(() => rm(root, { recursive: true, force: true }));

describe("posts", () => {
	it("creates, lists, updates and deletes a post through the store", async () => {
		await saveProductList(store, "cafeteiras", [product], author);

		const created = await savePost(store, "melhor-cafeteira", post, author);
		const file = await readFile(path.join(root, "content/posts/melhor-cafeteira.mdx"), "utf8");
		expect(file).toMatch(/^---\ntitle: Melhor Cafeteira\n/);
		expect(file).toContain('<CardsTable list="cafeteiras" />');

		expect(await listPosts(store)).toEqual([
			expect.objectContaining({ slug: "melhor-cafeteira", status: "published", sha: created.sha }),
		]);

		const updated = await savePost(
			store,
			"melhor-cafeteira",
			{ ...post, draft: true },
			author,
			created.sha,
		);
		expect((await getPost(store, "melhor-cafeteira"))?.status).toBe("draft");

		await deletePost(store, "melhor-cafeteira", author, updated.sha);
		expect(await getPost(store, "melhor-cafeteira")).toBeNull();
	});

	it("refuses to overwrite a newer version or an existing post", async () => {
		await saveProductList(store, "cafeteiras", [product], author);
		const created = await savePost(store, "melhor-cafeteira", post, author);
		await savePost(store, "melhor-cafeteira", { ...post, title: "Outro" }, author, created.sha);

		await expect(savePost(store, "melhor-cafeteira", post, author, created.sha)).rejects.toThrow(
			ConflictError,
		);
		await expect(savePost(store, "melhor-cafeteira", post, author)).rejects.toThrow(ConflictError);
	});

	it("rejects bodies that would break the build, unknown lists and bad slugs", async () => {
		await expect(savePost(store, "melhor-cafeteira", post, author)).rejects.toThrow(
			/cafeteiras.*não existe/,
		);
		await expect(savePost(store, "x", { ...post, body: "Preço: {valor}" }, author)).rejects.toThrow(
			ValidationError,
		);
		await expect(savePost(store, "../fora", { ...post, body: "ok" }, author)).rejects.toThrow(
			ValidationError,
		);
		await expect(
			savePost(store, "sem-titulo", { ...post, title: "", body: "ok" }, author),
		).rejects.toThrow(/title/);
	});

	it("reuses bundled sources and still lists files that fail to parse", async () => {
		await store.write("content/posts/quebrado.mdx", encode("---\ntitle: X\n---\n"), {
			message: "m",
			author,
		});
		const raw = "---\ntitle: Do Bundle\ndate: '2026-02-01'\ncategory: cozinha\n---\ntexto\n";
		const reads: string[] = [];
		const spy: ContentStore = {
			...store,
			list: async () => [
				...(await store.list("content/posts")),
				{ name: "do-bundle.mdx", path: "content/posts/do-bundle.mdx", sha: blobSha(encode(raw)) },
			],
			read: (file) => {
				reads.push(file);
				return store.read(file);
			},
		};

		const posts = await listPosts(spy, new Map([["do-bundle", raw]]));

		expect(posts.map((entry) => [entry.slug, entry.status])).toEqual([
			["do-bundle", "published"],
			["quebrado", "invalid"],
		]);
		expect(reads).toEqual(["content/posts/quebrado.mdx"]);
	});
});

describe("product lists", () => {
	it("saves formatted JSON and rejects repeated ids and empty lists", async () => {
		const saved = await saveProductList(store, "cafeteiras", [product], author);

		expect(await getProductList(store, "cafeteiras")).toMatchObject({
			sha: saved.sha,
			products: [{ id: "p1" }],
		});
		await expect(saveProductList(store, "x-lista", [product, product], author)).rejects.toThrow(
			/repetido: p1/,
		);
		await expect(saveProductList(store, "y-lista", [], author)).rejects.toThrow(ValidationError);
	});
});

describe("deleteProductList", () => {
	it("turns the posts that show the list into drafts without its cards, then deletes it", async () => {
		const list = await saveProductList(store, "cafeteiras", [product], author);
		await saveProductList(store, "moedores", [product], author);
		await savePost(
			store,
			"melhor-cafeteira",
			{
				...post,
				body: 'Abertura.\n\n<CardsTable list="cafeteiras" />\n\n<CardsTable list="moedores" />',
			},
			author,
		);
		await savePost(store, "sem-lista", { ...post, body: "Só texto." }, author);

		expect(listUsage(await listPosts(store))).toEqual(
			new Map([
				["cafeteiras", ["melhor-cafeteira"]],
				["moedores", ["melhor-cafeteira"]],
			]),
		);

		expect(await deleteProductList(store, "cafeteiras", author, list.sha)).toEqual({
			drafted: ["melhor-cafeteira"],
		});

		expect(await getProductList(store, "cafeteiras")).toBeNull();
		const drafted = await getPost(store, "melhor-cafeteira");
		expect(drafted?.post.draft).toBe(true);
		expect(drafted?.body).toBe('Abertura.\n\n<CardsTable list="moedores" />');
		expect((await getPost(store, "sem-lista"))?.post.draft).toBe(false);
	});

	it("leaves the posts alone when the version of the list is stale", async () => {
		await saveProductList(store, "cafeteiras", [product], author);
		await savePost(store, "melhor-cafeteira", post, author);

		await expect(deleteProductList(store, "cafeteiras", author, "stale")).rejects.toBeInstanceOf(
			ConflictError,
		);
		expect((await getPost(store, "melhor-cafeteira"))?.post.draft).toBe(false);
		expect(await getProductList(store, "cafeteiras")).not.toBeNull();
	});

	it("answers not found for a list that does not exist", async () => {
		await expect(deleteProductList(store, "nao-existe", author, "x")).rejects.toThrow(/nao-existe/);
	});
});

describe("images", () => {
	it("stores by real type, sanitizes the name and never overwrites", async () => {
		const file = { folder: "covers", filename: "Minha Capa (1).JPG", type: "image/jpeg", bytes: PNG };

		expect(await uploadImage(store, file, author)).toEqual({ url: "/images/covers/minha-capa-1.png" });
		expect(await uploadImage(store, file, author)).toEqual({ url: "/images/covers/minha-capa-1-2.png" });
		expect(await listImages(store, "covers")).toHaveLength(2);
	});

	it("rejects disguised files, oversize files and unknown folders", async () => {
		const html = { folder: "covers", filename: "a.png", type: "image/png", bytes: encode("<html>") };

		await expect(uploadImage(store, html, author)).rejects.toThrow(/WebP, JPEG ou PNG/);
		await expect(uploadImage(store, { ...html, folder: "../.." }, author)).rejects.toThrow(/Pasta/);
		await expect(
			uploadImage(store, { ...html, bytes: new Uint8Array(5 * 1024 * 1024) }, author),
		).rejects.toThrow(/4 MB/);
	});

	it("slugifies file names", () => {
		expect(slugifyFilename("Máquina de Lavar_12kg.webp")).toBe("maquina-de-lavar-12kg");
	});
});

describe("validateBody", () => {
	it("accepts Markdown with the registered component", () => {
		expect(validateBody('## Título\n\nTexto com <br> e **negrito**.\n\n<CardsTable list="x" />')).toEqual(
			[],
		);
	});

	it("flags code, scripts, event handlers and unknown components", () => {
		expect(validateBody("a {b}")).toHaveLength(1);
		expect(validateBody("<script>alert(1)</script>")).toHaveLength(1);
		expect(validateBody('<img src="x" onerror="alert(1)">')).toHaveLength(1);
		expect(validateBody("<svelte:head></svelte:head>")).toHaveLength(1);
		expect(validateBody("<Outro />")[0]).toContain("Componente desconhecido");
	});
});

describe("local images", () => {
	it("refuses a cover or a product image that is not in the store, since it would break the build", async () => {
		const withImage = [{ ...product, image: "/images/posts/foto.png" }];
		await expect(saveProductList(store, "cafeteiras", withImage, author)).rejects.toThrow(
			'A imagem "/images/posts/foto.png" não existe',
		);

		await uploadImage(
			store,
			{ folder: "posts", filename: "foto.png", type: "image/png", bytes: PNG },
			author,
		);
		await saveProductList(store, "cafeteiras", withImage, author);

		const withCover = { ...post, cover: "/images/covers/capa.png" };
		await expect(savePost(store, "melhor-cafeteira", withCover, author)).rejects.toThrow(ValidationError);

		await uploadImage(
			store,
			{ folder: "covers", filename: "capa.png", type: "image/png", bytes: PNG },
			author,
		);
		await savePost(store, "melhor-cafeteira", withCover, author);
	});
});

describe("store paths", () => {
	it("never read or write outside the repository, whatever path reaches the store", async () => {
		const github = createGitHubStore({ token: "t", repo: "owner/repo", branch: "main", fetch: vi.fn() });

		for (const path of [
			"static/../../../user/emails",
			"content/posts/../../secret",
			"./content",
			"content//x",
		]) {
			await expect(store.read(path)).rejects.toThrow("Unsafe content path");
			await expect(github.read(path)).rejects.toThrow("Unsafe content path");
			await expect(store.write(path, encode("x"), { message: "m", author })).rejects.toThrow(
				"Unsafe content path",
			);
		}
	});

	it("refuses a cover that points outside the images folder before touching the store", async () => {
		await expect(
			savePost(store, "melhor-cafeteira", { ...post, cover: "/../../secret.txt" }, author),
		).rejects.toThrow(ValidationError);
	});
});

describe("GitHub store", () => {
	const calls: { method: string; url: string; body?: Record<string, unknown> }[] = [];
	const respond = (status: number, body: unknown) => async (url: RequestInfo | URL, init?: RequestInit) => {
		calls.push({
			method: init?.method ?? "GET",
			url: String(url),
			body: init?.body ? JSON.parse(String(init.body)) : undefined,
		});
		return new Response(JSON.stringify(body), { status });
	};
	const github = (fetch: typeof globalThis.fetch) =>
		createGitHubStore({ token: "t", repo: "owner/repo", branch: "main", fetch });

	beforeEach(() => {
		calls.length = 0;
	});

	it("retries a server error and gives up with an error that names GitHub", async () => {
		let failures = 2;
		const flaky: typeof fetch = async (url, init) =>
			failures-- > 0
				? new Response("", { status: 500 })
				: respond(201, { content: { sha: "abc" } })(url, init);
		const store = (fetch: typeof globalThis.fetch) =>
			createGitHubStore({ token: "t", repo: "owner/repo", branch: "main", fetch, retryDelayMs: 0 });
		const commit = { message: "content: add post a", author };

		expect(await store(flaky).write("content/posts/a.mdx", encode("a"), commit)).toEqual({ sha: "abc" });
		expect(calls).toHaveLength(1);

		calls.length = 0;
		const down = store(respond(500, ""));
		await expect(down.write("content/posts/a.mdx", encode("a"), commit)).rejects.toBeInstanceOf(
			StoreFailedError,
		);
		expect(calls).toHaveLength(3);
	});

	it("commits a file with author, branch and base64 content", async () => {
		const result = await github(respond(201, { content: { sha: "abc" } })).write(
			"content/posts/novo post.mdx",
			encode("olá"),
			{ message: "content: add post novo", author },
		);

		expect(result).toEqual({ sha: "abc" });
		expect(calls[0]).toMatchObject({
			method: "PUT",
			url: "https://api.github.com/repos/owner/repo/contents/content/posts/novo%20post.mdx",
			body: { message: "content: add post novo", branch: "main", author, content: "b2zDoQ==" },
		});
	});

	it("says the store is unavailable when the disk refuses the write", async () => {
		// A file where a folder is expected fails like the read-only disk of a serverless deploy.
		await store.write("blocker", encode("x"), { message: "m", author: { name: "a", email: "a@b.c" } });
		const blocked = createLocalStore(path.join(root, "blocker")).write("file.txt", encode("x"), {
			message: "m",
			author: { name: "a", email: "a@b.c" },
		});

		await expect(blocked).rejects.toBeInstanceOf(StoreUnavailableError);
	});

	it("reads files, treats 404 as missing and lists only files", async () => {
		expect((await github(respond(200, { content: "b2zDoQ==", sha: "s1" })).read("a.mdx"))?.sha).toBe(
			"s1",
		);
		expect(await github(respond(404, {})).read("a.mdx")).toBeNull();
		expect(
			await github(
				respond(200, [
					{ type: "file", name: "a.mdx", path: "content/posts/a.mdx", sha: "1" },
					{ type: "dir", name: "sub", path: "content/posts/sub", sha: "2" },
				]),
			).list("content/posts"),
		).toEqual([{ name: "a.mdx", path: "content/posts/a.mdx", sha: "1" }]);
	});

	it("maps version clashes to ConflictError and other failures to errors", async () => {
		const commit = { message: "m", author, sha: "old" };

		await expect(github(respond(409, {})).write("a.mdx", encode("x"), commit)).rejects.toThrow(
			ConflictError,
		);
		await expect(github(respond(422, {})).remove("a.mdx", commit)).rejects.toThrow(ConflictError);
		await expect(
			github(respond(500, { message: "boom" })).write("a.mdx", encode("x"), commit),
		).rejects.toThrow(/failed with 500/);
	});

	it("lists the latest commits of a folder with only the subject line", async () => {
		const commit = {
			message: "content: add post x\n\nbody",
			author: { name: "Ana", date: "2026-10-06T12:00:00Z" },
		};
		const history = await github(
			respond(200, [{ sha: "c1", html_url: "https://github.com/c1", commit }]),
		).history("content", 5);

		expect(calls[0]?.url).toBe(
			"https://api.github.com/repos/owner/repo/commits?sha=main&path=content&per_page=5",
		);
		expect(history).toEqual([
			{
				sha: "c1",
				message: "content: add post x",
				author: "Ana",
				date: "2026-10-06T12:00:00Z",
				url: "https://github.com/c1",
			},
		]);
		expect(await createLocalStore(root).history("content", 5)).toEqual([]);
	});
});
