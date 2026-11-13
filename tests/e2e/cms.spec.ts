import { expect, test } from "./test.ts";

test("post, product and media routes render the static editor sign-in", async ({ page }) => {
	for (const path of ["/admin/posts", "/admin/products", "/admin/media"]) {
		await page.goto(path);
		await expect(page.getByRole("heading", { level: 1 })).toContainText("Painel editorial");
		await expect(page.getByLabel("Token do GitHub")).toBeVisible();
	}
});

test("saving JSON creates a branch and pull request", async ({ page }) => {
	const calls: string[] = [];
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
									: url.pathname.endsWith("/eletro/")
										? { permissions: { push: true } }
										: {};
		await route.fulfill({ status: 200, contentType: "application/json", body: JSON.stringify(body) });
	});
	await page.goto("/admin");
	await page.getByLabel("Token do GitHub").fill("test-token");
	await page.getByRole("button", { name: "Abrir painel" }).click();
	await page.getByRole("button", { name: "Configuração JSON" }).click();
	await page.getByRole("button", { name: "flags.json" }).click();
	await page.getByLabel("Conteúdo MDX ou JSON").fill('{"previewDrafts":true}');
	await page.getByRole("button", { name: "Salvar no GitHub" }).click();
	await expect(page.getByRole("link", { name: "Abrir pull request no GitHub" })).toBeVisible();
	expect(calls).toContain("POST /repos/AlexGalhardo/eletro/git/refs");
	expect(calls).toContain("PUT /repos/AlexGalhardo/eletro/contents/content/flags.json");
	expect(calls).toContain("POST /repos/AlexGalhardo/eletro/pulls");
});
