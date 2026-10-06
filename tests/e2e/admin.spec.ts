import { type APIRequestContext, expect, test } from "@playwright/test";

import { ADMIN, LOGIN_TOKEN as TOKEN } from "./env.ts";

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

	test("server-rendered responses carry the security headers", async ({ request }) => {
		for (const path of ["/admin/login", "/api/v1/health"]) {
			const headers = (await request.get(path)).headers();

			expect(headers["x-frame-options"], path).toBe("DENY");
			expect(headers["x-content-type-options"], path).toBe("nosniff");
			expect(headers["referrer-policy"], path).toBe("strict-origin-when-cross-origin");
		}
		expect((await request.get("/admin/login")).headers()["cache-control"]).toBe("no-store");
	});

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

test.describe("REST API", () => {
	test.skip(({ isMobile }) => isMobile, "HTTP-only checks do not depend on the viewport");

	test("reads are public, cross-origin and never indexable", async ({ request }) => {
		const response = await request.get("/api/v1/posts?pageSize=1");

		expect(response.status()).toBe(200);
		expect((await response.json()).data).toHaveLength(1);
		expect(response.headers()["access-control-allow-origin"]).toBe("*");
		expect(response.headers()["x-robots-tag"]).toContain("noindex");
	});

	test("writes answer 401 without a session", async ({ request, baseURL }) => {
		const attempts = [
			await request.post("/api/v1/posts", { data: { slug: "novo-post" } }),
			await request.put("/api/v1/posts/novo-post", { data: { sha: "x" } }),
			// A body-less request counts as a form for SvelteKit's CSRF check, so it needs the Origin a browser sends.
			await request.delete("/api/v1/posts/novo-post?sha=x", { headers: { origin: baseURL ?? "" } }),
			await request.post("/api/v1/products", { data: { name: "nova-lista", products: [] } }),
			await request.put("/api/v1/products/nova-lista", { data: { sha: "x", products: [] } }),
			await request.get("/api/v1/media?folder=covers"),
		];

		for (const response of attempts) {
			expect(response.status(), response.url()).toBe(401);
			expect((await response.json()).error.code).toBe("unauthorized");
		}
	});

	test("serves the OpenAPI document", async ({ request }) => {
		const document = await (await request.get("/api/v1/openapi.json")).json();

		expect(document.openapi).toBe("3.1.0");
		expect(Object.keys(document.paths)).toContain("/posts/{slug}");
	});
});
