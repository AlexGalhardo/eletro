import { type APIRequestContext, expect, test } from "@playwright/test";

// Credentials of the throwaway admin configured in playwright.config.ts.
const TOKEN = "e2e-login-token";
const ADMIN = "e2e-admin";

const login = (request: APIRequestContext, githubLogin = ADMIN, token = TOKEN) =>
	request.post("/api/test/login", { data: { token, githubLogin } });

test.describe("admin access", () => {
	for (const path of ["/admin", "/admin/posts"]) {
		test(`anonymous visitor on ${path} lands on the login page`, async ({ page }) => {
			await page.goto(path);

			await expect(page).toHaveURL("/admin/login");
			await expect(page.getByRole("heading", { level: 1 })).toContainText("Admin");
		});
	}

	test("the login page is never indexable", async ({ request }) => {
		const response = await request.get("/admin/login");

		expect(response.headers()["x-robots-tag"]).toContain("noindex");
		expect(await response.text()).toContain('<meta name="robots" content="noindex, nofollow"');
	});

	test("a wrong token or a user outside the allow list gets no session", async ({ page }) => {
		expect((await login(page.request, ADMIN, "wrong-token")).status()).toBe(401);
		expect((await login(page.request, "stranger")).status()).toBe(403);

		await page.goto("/admin");
		await expect(page).toHaveURL("/admin/login");
	});

	test("an admin reaches the dashboard, skips the login page and signs out", async ({ page }) => {
		expect((await login(page.request)).status()).toBe(200);

		await page.goto("/admin/login");
		await expect(page).toHaveURL("/admin");
		await expect(page.getByRole("heading", { name: "Painel" })).toBeVisible();
		await expect(page.getByText(ADMIN, { exact: true })).toBeVisible();

		await page.getByRole("button", { name: "Sair" }).click();
		await expect(page).toHaveURL("/admin/login");

		await page.goto("/admin");
		await expect(page).toHaveURL("/admin/login");
	});
});
