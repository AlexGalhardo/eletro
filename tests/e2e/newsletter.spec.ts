import { expect, test } from "@playwright/test";
import { ADMIN, LOGIN_TOKEN, open } from "./env.ts";

test("a visitor subscribes in the footer and the admin sees the pending address", async ({
	page,
}, testInfo) => {
	const email = `leitor-${testInfo.project.name}-${Date.now().toString(36)}@example.com`;

	await open(page, "/");
	await page.getByLabel("Receba as novas análises por e-mail").fill(email);
	await page.getByRole("button", { name: "Inscrever" }).click();
	await expect(page.getByText("confirme a inscrição pelo link")).toBeVisible();

	await page.request.post("/api/test/login", { data: { token: LOGIN_TOKEN, githubLogin: ADMIN } });
	await open(page, "/admin/newsletter");
	const row = page.getByRole("row").filter({ hasText: email });
	await expect(row).toContainText("Aguardando confirmação");

	await page.getByRole("button", { name: "Enviar fila agora" }).click();
	await expect(page.getByText("Não há envio na fila.")).toBeVisible();
});

test("links with an unknown token confirm and cancel nothing", async ({ page }) => {
	await open(page, "/newsletter/confirmar?token=desconhecido");
	await page.getByRole("button", { name: "Confirmar minha inscrição" }).click();
	await expect(page.getByRole("alert")).toContainText("Este link de confirmação não vale mais");

	await open(page, "/newsletter/sair?token=desconhecido");
	await page.getByRole("button", { name: "Cancelar minha inscrição" }).click();
	await expect(page.getByRole("alert")).toContainText("Este link não vale mais");
});

test("newsletter pages stay out of search engines", async ({ request }) => {
	for (const path of ["/newsletter/confirmar", "/newsletter/sair"]) {
		expect(await (await request.get(path)).text(), path).toContain(
			'<meta name="robots" content="noindex"',
		);
	}
	expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/newsletter");
});
