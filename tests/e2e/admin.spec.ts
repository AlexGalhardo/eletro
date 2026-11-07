import { expect, test } from "./test.ts";

test.describe("admin access", () => {
	for (const path of ["/admin", "/admin/posts", "/admin/login"]) {
		test(`anonymous visitor on ${path} sees the login gate`, async ({ page }) => {
			await page.goto(path);

			await expect(page).toHaveURL(new RegExp(`${path}/?$`));
			await expect(page.getByRole("heading", { level: 1 })).toContainText("Admin");
			await expect(
				page.getByText(
					/O painel ainda não está configurado|O login pelo GitHub ou Google não está configurado/,
				),
			).toBeVisible();
		});
	}

	test("the login page is never indexable", async ({ request }) => {
		const response = await request.get("/admin/login");

		expect(response.status()).toBe(200);
		expect(await response.text()).toContain('content="noindex');
	});
});

test.describe("REST API", () => {
	test.skip(({ isMobile }) => isMobile, "HTTP-only checks do not depend on the viewport");

	test("public reads are JSON at the trailing-slash URL", async ({ request }) => {
		const posts = await request.get("/api/v1/posts/index.json");

		expect(posts.status()).toBe(200);
		expect(posts.headers()["content-type"]).toContain("application/json");
		expect((await posts.json()).data.length).toBeGreaterThan(0);

		const products = await request.get("/api/v1/products/index.json");
		expect(products.headers()["content-type"]).toContain("application/json");
		expect((await products.json()).data.length).toBeGreaterThan(0);
	});

	test("writes are not executed on the static host", async ({ request }) => {
		const response = await request.post("/api/v1/posts", {
			data: { slug: "novo-post" },
			maxRedirects: 0,
		});

		expect(response.status()).toBe(404);
	});

	test("serves the OpenAPI document as JSON", async ({ request }) => {
		const response = await request.get("/api/v1/openapi.json");

		expect(response.status()).toBe(200);
		expect(response.headers()["content-type"]).toContain("application/json");
		const document = await response.json();
		expect(document.openapi).toBe("3.1.0");
		expect(Object.keys(document.paths)).toContain("/posts/{slug}");
	});
});
