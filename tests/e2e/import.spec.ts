import { expect, test } from "@playwright/test";
import { ADMIN, LOGIN_TOKEN } from "./env.ts";

// The successful import is covered by tests/integration/import.test.ts with a fake source site:
// an e2e run must not depend on the network, so here only the refusal path reaches the server.
test.describe("post import", () => {
	test("anonymous visitor lands on the login page", async ({ page }) => {
		await page.goto("/admin/import");

		await expect(page).toHaveURL("/admin/login");
	});

	test("an admin opens the page from the menu and is told when the address is not allowed", async ({
		page,
	}) => {
		await page.request.post("/api/test/login", { data: { token: LOGIN_TOKEN, githubLogin: ADMIN } });
		await page.goto("/admin");

		await page
			.getByRole("navigation", { name: "Painel" })
			.getByRole("link", { name: "Importar" })
			.click();
		await expect(page).toHaveURL("/admin/import");
		await expect(page.getByRole("heading", { name: "Importar post" })).toBeVisible();

		await page.getByLabel("Endereço do post de origem").fill("https://example.com/cozinha/qualquer/");
		await page.getByRole("button", { name: "Iniciar importação" }).click();

		await expect(page.getByRole("alert")).toContainText("Informe um endereço https de");
		await expect(page.getByRole("link", { name: "Abrir o rascunho" })).toHaveCount(0);
	});
});
