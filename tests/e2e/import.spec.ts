import { expect, test } from "./test.ts";

test("the import route renders the static editor sign-in", async ({ page }) => {
	await page.goto("/admin/import");
	await expect(page.getByRole("heading", { level: 1 })).toContainText("Painel editorial");
	await expect(page.getByLabel("Token do GitHub")).toBeVisible();
});
