import { expect, test } from "@playwright/test";
import { ADMIN, LOGIN_TOKEN } from "./env.ts";

test("a visitor subscribes in the footer and the admin sees the pending address", async ({
	page,
}, testInfo) => {
	const email = `leitor-${testInfo.project.name}-${Date.now().toString(36)}@example.com`;

	await page.goto("/");
	await page.getByLabel("Receba as novas análises por e-mail").fill(email);
	await page.getByRole("button", { name: "Inscrever" }).click();
	await expect(page.getByText("confirme a inscrição pelo link")).toBeVisible();

	await page.request.post("/api/test/login", { data: { token: LOGIN_TOKEN, githubLogin: ADMIN } });
	await page.goto("/admin/newsletter");
	const row = page.getByRole("row").filter({ hasText: email });
	await expect(row).toContainText("Aguardando confirmação");

	await page.getByRole("button", { name: "Enviar fila agora" }).click();
	await expect(page.getByText("Não há envio na fila.")).toBeVisible();
});

test("links with an unknown token confirm and cancel nothing", async ({ page }) => {
	await page.goto("/newsletter/confirmar?token=desconhecido");
	await expect(page.getByRole("heading", { name: "Link inválido" })).toBeVisible();

	await page.goto("/newsletter/sair?token=desconhecido");
	await page.getByRole("button", { name: "Cancelar minha inscrição" }).click();
	await expect(page.getByRole("alert")).toContainText("Este link não vale mais");
});

test("newsletter pages stay out of search engines", async ({ request }) => {
	for (const path of ["/newsletter/confirmar?token=x", "/newsletter/sair"]) {
		expect(await (await request.get(path)).text(), path).toContain(
			'<meta name="robots" content="noindex"',
		);
	}
	expect(await (await request.get("/sitemap.xml")).text()).not.toContain("/newsletter");
});
