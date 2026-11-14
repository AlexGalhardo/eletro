import { sealCredential } from "../../src/lib/admin/credential.ts";
import { expect, test } from "./test.ts";

test("post, product and media routes send an anonymous visitor to the login", async ({ page }) => {
	for (const path of ["/admin/posts", "/admin/products", "/admin/media"]) {
		await page.goto(path);
		await expect(page).toHaveURL(/\/admin\/login\?next=/);
		await expect(page.getByPlaceholder("Password")).toBeVisible();
		await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
	}
});

test("password login and saving JSON create a branch and pull request", async ({ page }) => {
	const calls: string[] = [];
	const password = "a long private admin passphrase";
	await page.route("**/admin-credential.json", async (route) => {
		await route.fulfill({
			status: 200,
			contentType: "application/json",
			body: JSON.stringify(await sealCredential("test-token", password)),
		});
	});
	await page.route("https://api.github.com/**", async (route) => {
		const request = route.request();
		const url = new URL(request.url());
		calls.push(`${request.method()} ${url.pathname}`);
		const body = url.pathname.endsWith("/user")
			? { login: "editor" }
			: url.pathname.endsWith("/git/ref/heads/main")
				? { object: { sha: "main-sha" } }
				: url.pathname.endsWith("/pulls")
					? { html_url: "https://github.com/AlexGalhardo/eletro/pull/1" }
					: url.pathname.endsWith("/content/posts")
						? []
						: url.pathname.endsWith("/content/products")
							? []
							: url.pathname.endsWith("/content")
								? [
										{
											name: "flags.json",
											path: "content/flags.json",
											sha: "old",
											type: "file",
										},
									]
								: url.pathname.endsWith("/content/flags.json") && request.method() === "GET"
									? {
											name: "flags.json",
											path: "content/flags.json",
											sha: "old",
											type: "file",
											content: btoa("{}"),
										}
									: url.pathname.endsWith("/eletro")
										? { permissions: { push: true } }
										: {};
		await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
	});
	await page.goto("/admin");
	await page.getByLabel("Credencial de acesso").fill(password);
	await page.getByRole("button", { name: "Login" }).click();
	await expect(page.getByRole("heading", { name: "Painel editorial" })).toBeVisible();
	await page.getByRole("button", { name: "Configuração JSON" }).click();
	await page.getByRole("button", { name: "flags.json" }).click();
	await page.getByLabel("Conteúdo MDX ou JSON").fill('{"previewDrafts":true}');
	await page.getByRole("button", { name: "Salvar no GitHub" }).click();
	await expect(page.getByRole("link", { name: "Abrir pull request no GitHub" })).toBeVisible();
	expect(calls).toContain("POST /repos/AlexGalhardo/eletro/git/refs");
	expect(calls).toContain("GET /repos/AlexGalhardo/eletro");
	expect(calls).toContain("PUT /repos/AlexGalhardo/eletro/contents/content/flags.json");
	expect(calls).toContain("POST /repos/AlexGalhardo/eletro/pulls");
});

test("the editor creates posts and previews linked products and images", async ({ page }) => {
	const pixel =
		"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVQIHWP4z8DwHwAFgAI/ScL/nwAAAABJRU5ErkJggg==";
	const existing =
		'---\ntitle: "Air fryer"\ndate: "2026-11-01"\ncategory: "cozinha"\ncover: "/images/covers/demo.webp"\ndraft: false\n---\n\n<CardsTable list="airfryers-8-litros" />';
	let savedPost = "";
	await page.route("https://api.github.com/**", async (route) => {
		const request = route.request();
		const path = new URL(request.url()).pathname;
		let body: unknown = {};
		if (path.endsWith("/user")) body = { login: "editor" };
		else if (path.endsWith("/eletro")) body = { permissions: { push: true } };
		else if (path.endsWith("/git/ref/heads/main")) body = { object: { sha: "main-sha" } };
		else if (path.endsWith("/pulls"))
			body = { html_url: "https://github.com/AlexGalhardo/eletro/pull/1" };
		else if (path.endsWith("/content/posts"))
			body = [
				{
					name: "melhor-airfryer-8-litros.mdx",
					path: "content/posts/melhor-airfryer-8-litros.mdx",
					sha: "old",
					type: "file",
				},
			];
		else if (path.endsWith("/content/products"))
			body = [
				{
					name: "airfryers-8-litros.json",
					path: "content/products/airfryers-8-litros.json",
					sha: "old",
					type: "file",
				},
			];
		else if (path.endsWith("/static/images"))
			body = [{ name: "covers", path: "static/images/covers", sha: "", type: "dir" }];
		else if (path.endsWith("/static/images/covers"))
			body = [
				{
					name: "demo.webp",
					path: "static/images/covers/demo.webp",
					sha: "old",
					type: "file",
					download_url: pixel,
				},
			];
		else if (path.endsWith("/content/posts/melhor-airfryer-8-litros.mdx"))
			body = {
				name: "melhor-airfryer-8-litros.mdx",
				path: "content/posts/melhor-airfryer-8-litros.mdx",
				sha: "old",
				type: "file",
				content: btoa(existing),
			};
		else if (path.endsWith("/content/posts/minha-nova-review.mdx") && request.method() === "GET")
			body = {
				name: "minha-nova-review.mdx",
				path: "content/posts/minha-nova-review.mdx",
				sha: "new",
				type: "file",
				content: Buffer.from(savedPost, "utf8").toString("base64"),
			};
		else if (path.endsWith("/content/products/airfryers-8-litros.json"))
			body = {
				name: "airfryers-8-litros.json",
				path: "content/products/airfryers-8-litros.json",
				sha: "old",
				type: "file",
				content: btoa(
					JSON.stringify([{ id: "item", name: "Item", image: "/images/posts/item.webp" }]),
				),
			};
		else if (path.endsWith("/content/posts/minha-nova-review.mdx") && request.method() === "PUT")
			savedPost = Buffer.from(request.postDataJSON().content, "base64").toString("utf8");
		await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
	});
	await page.goto("/admin");
	await page.getByLabel("Credencial de acesso").fill("test-token");
	await page.getByRole("button", { name: "Login" }).click();
	const darkBefore = await page.locator("html").evaluate((node) => node.classList.contains("dark"));
	await page.getByRole("button", { name: "Alternar tema" }).click();
	expect(await page.locator("html").evaluate((node) => node.classList.contains("dark"))).toBe(!darkBefore);

	await page.getByRole("button", { name: "Novo arquivo" }).click();
	await page.getByLabel("Slug").fill("minha-nova-review");
	await page.getByLabel("Título").fill("Minha nova review");
	await page.getByLabel("Data de publicação").fill("2026-12-01");
	await expect(page.getByLabel("Rascunho")).toBeChecked();
	await page.getByLabel("Lista de produtos").selectOption("airfryers-8-litros");
	await page.getByRole("button", { name: "Vincular lista" }).click();
	await page.getByRole("button", { name: "Salvar no GitHub" }).click();
	await expect.poll(() => savedPost).toContain('title: "Minha nova review"');
	expect(savedPost).toContain('date: "2026-12-01"');
	expect(savedPost).toContain("draft: true");
	expect(savedPost).toContain('<CardsTable list="airfryers-8-litros" />');

	await page.locator("[data-relations]").getByRole("button", { name: "airfryers-8-litros" }).click();
	await expect(
		page.locator("[data-relations]").getByRole("button", { name: "minha-nova-review" }),
	).toBeVisible();
	await expect(page.locator("[data-content-images] img")).toHaveCount(1);
	await page.locator("[data-relations]").getByRole("button", { name: "minha-nova-review" }).click();
	await page.getByRole("button", { name: "Imagens", exact: true }).click();
	await page.getByRole("button", { name: "covers" }).click();
	await expect(page.locator("[data-files] img")).toHaveCount(1);
	await page.getByRole("button", { name: "demo.webp" }).click();
	await expect(page.getByRole("heading", { name: "Prévia da imagem" })).toBeVisible();
	await page.getByRole("button", { name: "Usar como capa" }).click();
	await expect(page.getByRole("textbox", { name: "Capa", exact: true })).toHaveValue(
		"/images/covers/demo.webp",
	);

	await page.locator('[data-upload-form] input[type="file"]').setInputFiles({
		name: "nova.png",
		mimeType: "image/png",
		buffer: Buffer.from(pixel.split(",")[1] ?? "", "base64"),
	});
	await expect(page.getByRole("img", { name: "Prévia da imagem para upload" })).toBeVisible();
	await page.getByRole("button", { name: "Enviar", exact: true }).click();
	await expect(page.locator("[data-upload-name]")).toContainText("Enviada: /images/covers/nova.png");
	await expect(page.getByRole("img", { name: "Prévia da imagem para upload" })).toBeVisible();
});
