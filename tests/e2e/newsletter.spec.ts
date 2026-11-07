import { open } from "./env.ts";
import { expect, test } from "./test.ts";

test("the footer form reports that the static host cannot subscribe", async ({ page }) => {
	await open(page, "/");
	await page.getByLabel("Receba as novas análises por e-mail").fill("leitor@example.com");
	await page.getByRole("button", { name: "Inscrever" }).click();

	await expect(
		page.getByText("Não foi possível inscrever agora. Confira o e-mail e tente de novo."),
	).toBeVisible();
});

test("confirmation and unsubscribe pages render and refuse a token the host cannot check", async ({
	page,
}) => {
	await open(page, "/newsletter/confirmar?token=desconhecido");
	await page.getByRole("button", { name: "Confirmar minha inscrição" }).click();
	await expect(page.getByRole("alert")).toBeVisible();

	await open(page, "/newsletter/sair?token=desconhecido");
	await page.getByRole("button", { name: "Cancelar minha inscrição" }).click();
	await expect(page.getByRole("alert")).toBeVisible();
});

test("newsletter pages stay out of search engines", async ({ request }) => {
	for (const path of ["/newsletter/confirmar", "/newsletter/sair"]) {
		expect(await (await request.get(path)).text(), path).toContain('content="noindex');
	}
	expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/newsletter");
});

test("the newsletter screen renders the login gate", async ({ page }) => {
	await page.goto("/admin/newsletter");

	await expect(page.getByRole("heading", { level: 1 })).toContainText("Admin");
	await expect(page.getByRole("button", { name: "Enviar fila agora" })).toHaveCount(0);
});
