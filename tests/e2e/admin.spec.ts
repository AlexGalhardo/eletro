import type { Page } from "@playwright/test";
import { expect, test } from "./test.ts";

const SESSION_KEY = "admin-session";

async function withSession(page: Page): Promise<void> {
	await page.addInitScript((key) => {
		if (!sessionStorage.getItem(key))
			sessionStorage.setItem(
				key,
				JSON.stringify({ token: "test-token", expires: Date.now() + 3_600_000 }),
			);
	}, SESSION_KEY);
}

async function mockGithub(page: Page): Promise<void> {
	await page.route("https://api.github.com/**", (route) => {
		const { pathname } = new URL(route.request().url());
		const body =
			pathname === "/user"
				? {}
				: pathname.includes("/contents/")
					? []
					: { permissions: { push: true } };
		return route.fulfill({ json: body });
	});
}

test.describe("admin access", () => {
	for (const path of ["/admin", "/admin/posts", "/admin/flags", "/admin/metrics"]) {
		test(`anonymous visitor on ${path} is sent to the login`, async ({ page }) => {
			await page.goto(path);
			await expect(page).toHaveURL(
				(url) => url.pathname === "/admin/login" && url.searchParams.get("next") === path,
			);
			await expect(page.getByPlaceholder("Password")).toBeVisible();
			await expect(page.getByRole("button", { name: "Login" })).toBeVisible();
			await expect(page.getByRole("navigation", { name: "Navegação do painel" })).toHaveCount(0);
		});
	}

	test("/admin/flags without a session goes to /admin/login?next=/admin/flags", async ({ page }) => {
		await page.goto("/admin/flags");
		await expect(page).toHaveURL(/\/admin\/login\?next=\/admin\/flags$/);
	});

	test("the login page has no sidebar and a Password placeholder", async ({ page }) => {
		await page.goto("/admin/login");
		await expect(page.getByPlaceholder("Password")).toBeVisible();
		await expect(page.locator("[data-slot=sidebar]")).toHaveCount(0);
	});

	test("login returns to the requested route and Sair goes back to the login", async ({
		page,
		isMobile,
	}) => {
		await mockGithub(page);
		await page.goto("/admin/login?next=/admin/flags");
		await page.getByPlaceholder("Password").fill("a-token");
		await page.getByRole("button", { name: "Login" }).click();
		await expect(page).toHaveURL(/\/admin\/flags$/);
		await expect(page.getByRole("heading", { name: "Feature flags" })).toBeVisible();

		if (isMobile) await page.getByRole("button", { name: "Recolher ou expandir o menu" }).click();
		await page.getByRole("button", { name: "Sair" }).click();
		await expect(page).toHaveURL(/\/admin\/login$/);
		expect(await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY)).toBeNull();
		await page.goto("/admin/flags");
		await expect(page).toHaveURL(/\/admin\/login\?next=/);
	});

	test("an unsafe next is ignored after the login", async ({ page }) => {
		await mockGithub(page);
		await page.goto("/admin/login?next=https://evil.example/admin/x");
		await page.getByPlaceholder("Password").fill("a-token");
		await page.getByRole("button", { name: "Login" }).click();
		await expect(page).toHaveURL(/localhost:\d+\/admin\/?$|\/admin$/);
	});

	test("an expired session is sent to the login", async ({ page }) => {
		await page.addInitScript((key) => {
			sessionStorage.setItem(key, JSON.stringify({ token: "t", expires: 1 }));
		}, SESSION_KEY);
		await page.goto("/admin/flags");
		await expect(page).toHaveURL(/\/admin\/login\?next=\/admin\/flags$/);
	});

	test("with a session, the editor opens on /admin/posts", async ({ page }) => {
		await withSession(page);
		await mockGithub(page);
		await page.goto("/admin/posts");
		await expect(page.getByRole("heading", { name: "Painel editorial" })).toBeVisible();
	});

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
	await withSession(page);
	await page.goto("/admin/metrics");
	const nav = page.getByRole("complementary").or(page.locator("[data-slot=sidebar]")).first();
	for (const name of ["Produtos e links", "Posts", "Métricas", "Flags", "Newsletter"]) {
		await expect(nav.getByRole("link", { name })).toBeVisible();
	}
	await expect(nav.getByRole("link", { name: "Métricas" })).toHaveAttribute("aria-current", "page");
	await page.getByRole("button", { name: "Recolher ou expandir o menu" }).click();
	await expect(page.locator("[data-slot=sidebar][data-state=collapsed]")).toHaveCount(1);
});
