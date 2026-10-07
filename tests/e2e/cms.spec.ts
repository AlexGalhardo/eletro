import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { expect, test } from "@playwright/test";
import { ADMIN, CONTENT_ROOT, LOGIN_TOKEN, open } from "./env.ts";

// A real one-pixel PNG: the server only reads the signature, but the editor renders what was sent.
const PNG = Buffer.from(
	"iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==",
	"base64",
);
const image = (name: string) => ({ name, mimeType: "image/png", buffer: PNG });

test("an admin publishes a new review using only the browser", async ({ page }, testInfo) => {
	// Unique per run and per project: the scratch folder outlives the test run.
	const id = `${testInfo.project.name}-${Date.now().toString(36)}`;
	const list = `cafeteiras-${id}`;
	const slug = `melhor-cafeteira-${id}`;
	// Exact names: "Pergunta 1" must not also match the "Remover pergunta 1" button.
	const field = (name: string) => page.getByLabel(name, { exact: true });

	const login = await page.request.post("/api/test/login", {
		data: { token: LOGIN_TOKEN, githubLogin: ADMIN },
	});
	expect(login.status()).toBe(200);

	await test.step("creates a product list with two products", async () => {
		await open(page, "/admin/products");
		await page.getByRole("link", { name: "Nova lista" }).click();

		await field("Nome da lista").fill(list);
		await field("Nome do produto 1").fill("Cafeteira Um");
		await field("Id do produto 1").fill("cafeteira-um");
		await field("Enviar imagem: Imagem do produto 1").setInputFiles(image(`Um ${id}.png`));
		await expect(field("Imagem do produto 1")).toHaveValue(`/images/posts/um-${id}.png`);
		await field("Link Mercado Livre do produto 1").fill("https://meli.la/um");
		await field("Vantagens do produto 1 (uma por linha)").fill("Rápida\nSilenciosa");
		await page.getByRole("button", { name: "Adicionar característica" }).click();
		await field("Característica 1 do produto 1").fill("Potência");
		await field("Valor 1 do produto 1").fill("1200 W");

		await page.getByRole("button", { name: "Adicionar produto" }).click();
		await field("Nome do produto 2").fill("Cafeteira Dois");
		// The id of the second product is left empty: it is generated from the name when saving.
		await field("Imagem do produto 2").fill("/images/posts/nao-enviada.png");
		await field("Link Amazon do produto 2").fill("https://amzn.to/dois");

		// An image that was never uploaded would break the site build, so the list is refused.
		await page.getByRole("button", { name: "Salvar" }).first().click();
		await expect(page.getByRole("alert")).toContainText(
			'A imagem "/images/posts/nao-enviada.png" não existe',
		);

		await field("Enviar imagem: Imagem do produto 2").setInputFiles(image(`Dois ${id}.png`));
		await expect(field("Imagem do produto 2")).toHaveValue(`/images/posts/dois-${id}.png`);
		await page.getByRole("button", { name: "Salvar" }).first().click();

		await expect(page).toHaveURL(`/admin/products/${list}`);
		await expect(page.getByRole("heading", { name: `Lista: ${list}` })).toBeVisible();
	});

	await test.step("writes the post with a cover, the list and a FAQ", async () => {
		await open(page, "/admin/posts");
		await page.getByRole("link", { name: "Novo post" }).click();

		await field("Título").fill("Melhor Cafeteira de Teste");
		await expect(field("Endereço (slug)")).toHaveValue("melhor-cafeteira-de-teste");
		await field("Endereço (slug)").fill(slug);
		await field("Descrição").fill("As cafeteiras que valem a compra.");
		await field("Categoria").selectOption("cozinha");

		await field("Enviar imagem: Capa").setInputFiles({
			name: `Capa ${id}.png`,
			mimeType: "image/png",
			buffer: PNG,
		});
		await expect(field("Capa")).toHaveValue(`/images/covers/capa-${id}.png`);
		// The file is not deployed yet: the preview comes from the copy the browser just sent.
		await expect(page.getByRole("img", { name: "Pré-visualização: Capa" })).toHaveAttribute(
			"src",
			/^blob:/,
		);

		await field("Conteúdo (Markdown)").fill("## Abertura\n\nTexto da review.");
		await field("Lista de produtos").selectOption(list);
		await page.getByRole("button", { name: "Inserir lista" }).click();
		await expect(field("Conteúdo (Markdown)")).toHaveValue(new RegExp(`<CardsTable list="${list}" />`));

		await page.getByRole("button", { name: "Adicionar pergunta" }).click();
		await field("Pergunta 1").fill("Qual escolher?");
		await field("Resposta 1").fill("A que cabe no bolso.");

		await page.getByRole("button", { name: "Salvar" }).click();

		await expect(page).toHaveURL(`/admin/posts/${slug}`);
		await expect(page.getByRole("heading", { name: "Editar post" })).toBeVisible();
		await expect(page.getByText("Salvo no disco local")).toBeVisible();
	});

	await test.step("stores files the site build accepts", () => {
		const post = readFileSync(path.join(CONTENT_ROOT, `content/posts/${slug}.mdx`), "utf8");
		const products = JSON.parse(
			readFileSync(path.join(CONTENT_ROOT, `content/products/${list}.json`), "utf8"),
		);

		expect(post).toContain("title: Melhor Cafeteira de Teste");
		expect(post).toContain("category: cozinha");
		expect(post).toContain(`cover: /images/covers/capa-${id}.png`);
		expect(post).toContain("question: Qual escolher?");
		expect(post).toContain(`<CardsTable list="${list}" />`);
		expect(products).toHaveLength(2);
		expect(products[1].id).toBe("cafeteira-dois");
		expect(products[0]).toMatchObject({
			id: "cafeteira-um",
			advantages: ["Rápida", "Silenciosa"],
			technicalDetails: [{ label: "Potência", value: "1200 W" }],
		});
		expect(existsSync(path.join(CONTENT_ROOT, `static/images/covers/capa-${id}.png`))).toBe(true);
	});

	await test.step("finds the post in the list, edits it and refuses a broken body", async () => {
		await open(page, "/admin/posts");
		await field("Buscar").fill(slug);
		const row = page.getByRole("row").filter({ hasText: "Melhor Cafeteira de Teste" });
		await expect(row).toHaveCount(1);
		await expect(row).toContainText("Publicado");
		await row.getByRole("link", { name: "Melhor Cafeteira de Teste" }).click();

		await field("Conteúdo (Markdown)").fill("<script>alert(1)</script>");
		await page.getByRole("button", { name: "Salvar" }).click();
		await expect(page.getByRole("alert")).toBeVisible();

		await field("Conteúdo (Markdown)").fill(`Texto revisado.\n\n<CardsTable list="${list}" />`);
		await field("Título").fill("Melhor Cafeteira Revisada");
		await page.getByRole("button", { name: "Salvar" }).click();
		await expect(page.getByText("Post salvo.")).toBeVisible();
		expect(readFileSync(path.join(CONTENT_ROOT, `content/posts/${slug}.mdx`), "utf8")).toContain(
			"title: Melhor Cafeteira Revisada",
		);
	});

	await test.step("shows the upload in the media library and the totals on the dashboard", async () => {
		await open(page, "/admin/media");
		const cover = page.getByRole("listitem").filter({ hasText: `/images/covers/capa-${id}.png` });
		await expect(cover).toBeVisible();

		// The copied link is the full address on this server, shown back in a dialog.
		await cover.getByRole("button", { name: "Copiar link" }).click();
		const copied = page.getByRole("dialog", { name: "Link copiado" });
		await expect(copied).toContainText(new URL(`/images/covers/capa-${id}.png`, page.url()).href);
		await copied.getByRole("button", { name: "OK" }).click();
		await expect(copied).toBeHidden();

		await open(page, "/admin");
		await expect(page.getByText("Posts publicados")).toBeVisible();
		await expect(page.getByText("Assinantes confirmados")).toBeVisible();
	});

	await test.step("links the post and its product list both ways", async () => {
		await open(page, "/admin/posts");
		await expect(page.getByRole("link", { name: list, exact: true })).toHaveAttribute(
			"href",
			`/admin/products/${list}`,
		);

		await open(page, "/admin/products");
		await field("Uso").selectOption("unused");
		await expect(page.getByRole("link", { name: list, exact: true })).toBeHidden();
		await field("Uso").selectOption("used");
		await expect(page.getByRole("listitem").filter({ hasText: list })).toContainText(`Usada em: ${slug}`);
	});

	await test.step("deletes the product list, which turns the post that shows it into a draft", async () => {
		await open(page, `/admin/products/${list}`);
		page.once("dialog", (dialog) => {
			expect(dialog.message()).toContain(slug);
			dialog.accept();
		});
		await page.getByRole("button", { name: "Excluir lista" }).click();

		await expect(page).toHaveURL("/admin/products");
		expect(existsSync(path.join(CONTENT_ROOT, `content/products/${list}.json`))).toBe(false);
		const post = readFileSync(path.join(CONTENT_ROOT, `content/posts/${slug}.mdx`), "utf8");
		expect(post).toContain("draft: true");
		expect(post).not.toContain("<CardsTable");
	});

	await test.step("deletes the post", async () => {
		await open(page, `/admin/posts/${slug}`);
		page.once("dialog", (dialog) => dialog.accept());
		await page.getByRole("button", { name: "Excluir" }).click();

		await expect(page).toHaveURL("/admin/posts");
		expect(existsSync(path.join(CONTENT_ROOT, `content/posts/${slug}.mdx`))).toBe(false);
	});
});
