import { expect, test } from "./test.ts";

test.describe("admin access", () => {
	for (const path of ["/admin", "/admin/posts", "/admin/login"]) {
		test(`anonymous visitor on ${path} sees the minimal login form`, async ({ page }) => {
			await page.goto(path);
			await expect(page.getByLabel("Credencial de acesso")).toBeVisible();
			await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
			await expect(page.getByRole("heading", { name: "Painel editorial" })).toBeHidden();
			await expect(page.getByText("AlexGalhardo/eletro")).toHaveCount(0);
			await expect(page.getByRole("button", { name: "Salvar no GitHub" })).toBeHidden();
		});
	}

	test("the admin stays out of search engines", async ({ request }) => {
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

test("the admin sidebar lists the sections and collapses", async ({ page, isMobile }) => {
	test.skip(isMobile, "On mobile the sidebar is an off-canvas sheet");
	await page.goto("/admin/metrics");
	const nav = page.getByRole("complementary").or(page.locator("[data-slot=sidebar]")).first();
	for (const name of ["Produtos e links", "Posts", "Métricas", "Flags", "Newsletter"]) {
		await expect(nav.getByRole("link", { name })).toBeVisible();
	}
	await expect(nav.getByRole("link", { name: "Métricas" })).toHaveAttribute("aria-current", "page");
	await page.getByRole("button", { name: "Recolher ou expandir o menu" }).click();
	await expect(page.locator("[data-slot=sidebar][data-state=collapsed]")).toHaveCount(1);
});
