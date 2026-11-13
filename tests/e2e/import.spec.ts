import { expect, test } from "./test.ts";

test("the import route renders the static editor sign-in", async ({ page }) => {
	await page.goto("/admin/import");
	await expect(page.getByLabel("Credencial de acesso")).toBeVisible();
	await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});
