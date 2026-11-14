import { open } from "./env.ts";
import { expect, test } from "./test.ts";

test("the static footer does not offer a nonfunctional signup", async ({ page }) => {
	await open(page, "/");
	await expect(page.getByLabel("Receba as novas análises por e-mail")).toHaveCount(0);
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

test("the newsletter screen is a placeholder until the vukem-email integration", async ({ page }) => {
	await page.goto("/admin/newsletter");

	await expect(page.getByText("Em breve")).toBeVisible();
	await expect(page.getByRole("button", { name: "Conectar ao vukem-email" })).toBeDisabled();
	await expect(page.getByRole("button", { name: "Enviar fila agora" })).toHaveCount(0);
});
