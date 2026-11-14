import { expect, test } from "./test.ts";

test("the import route sends an anonymous visitor to the login", async ({ page }) => {
	await page.goto("/admin/import");
	await expect(page).toHaveURL(/\/admin\/login\?next=\/admin\/import$/);
	await expect(page.getByPlaceholder("Password")).toBeVisible();
	await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
});
