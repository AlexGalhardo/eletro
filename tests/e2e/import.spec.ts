import { expect, test } from "./test.ts";

test("the import screen renders the login gate", async ({ page }) => {
	await page.goto("/admin/import");

	await expect(page.getByRole("heading", { level: 1 })).toContainText("Admin");
	await expect(
		page.getByText(
			/O painel ainda não está configurado|O login pelo GitHub ou Google não está configurado/,
		),
	).toBeVisible();
	await expect(page.getByLabel("Endereço do post de origem")).toHaveCount(0);
});
