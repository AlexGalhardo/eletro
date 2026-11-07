import { expect, test } from "./test.ts";

// Creating and editing posts is covered by the integration tests. The static host ships the login gate.
test("post, product and media screens render the login gate", async ({ page }) => {
	for (const path of ["/admin/posts", "/admin/products", "/admin/media"]) {
		await page.goto(path);

		await expect(page.getByRole("heading", { level: 1 })).toContainText("Admin");
		await expect(
			page.getByText(
				/O painel ainda não está configurado|O login pelo GitHub ou Google não está configurado/,
			),
		).toBeVisible();
		await expect(page.getByLabel("Nome da lista")).toHaveCount(0);
	}
});
