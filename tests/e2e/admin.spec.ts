import { login, mockGithub } from "./admin-session.ts";
import { expect, test } from "./test.ts";

const SESSION_KEY = "admin-session";

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
		await login(page, "/admin/flags");
		await expect(page.getByRole("heading", { name: "Feature flags" })).toBeVisible();
		const stored = await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY);
		expect(Object.keys(JSON.parse(stored ?? "{}")).sort()).toEqual(["ciphertext", "expires", "iv"]);
		expect(stored).not.toContain("a-token");

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
		await expect(page).toHaveURL((url) => url.pathname === "/admin");
	});

	test("an expired session is sent to the login", async ({ page }) => {
		await page.addInitScript((key) => {
			sessionStorage.setItem(key, JSON.stringify({ iv: "AAAA", ciphertext: "AAAA", expires: 1 }));
		}, SESSION_KEY);
		await page.goto("/admin/flags");
		await expect(page).toHaveURL(/\/admin\/login\?next=\/admin\/flags$/);
	});

	test("a session whose key is gone is sent to the login", async ({ page }) => {
		await login(page, "/admin/flags");
		await page.evaluate(
			() =>
				new Promise<void>((resolve) => {
					const request = indexedDB.deleteDatabase("admin-session");
					request.onsuccess = () => resolve();
					request.onblocked = () => resolve();
				}),
		);
		await page.goto("/admin/flags");
		await expect(page).toHaveURL(/\/admin\/login\?next=\/admin\/flags$/);
		expect(await page.evaluate((key) => sessionStorage.getItem(key), SESSION_KEY)).toBeNull();
	});

	test("with a session, the editor opens on /admin/posts under the CSP, with no third-party request", async ({
		page,
	}) => {
		const violations: string[] = [];
		const hosts = new Set<string>();
		page.on("console", (message) => {
			if (/Content Security Policy/i.test(message.text())) violations.push(message.text());
		});
		page.on("request", (request) => {
			const url = new URL(request.url());
			if (url.protocol.startsWith("http")) hosts.add(url.host);
		});
		await login(page, "/admin/posts");
		await expect(page.getByRole("heading", { name: "Painel editorial" })).toBeVisible();
		await page.goto("/admin/flags");
		await expect(page.getByRole("heading", { name: "Feature flags" })).toBeVisible();
		await expect(page.locator('meta[http-equiv="Content-Security-Policy"]')).toHaveAttribute(
			"content",
			/connect-src 'self' https:\/\/api\.github\.com/,
		);
		await expect(page.getByText(/cookies/i)).toHaveCount(0);
		expect(violations).toEqual([]);
		expect(
			[...hosts].filter((host) => host !== new URL(page.url()).host && host !== "api.github.com"),
		).toEqual([]);
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
	await login(page, "/admin/metrics");
	const nav = page.getByRole("complementary").or(page.locator("[data-slot=sidebar]")).first();
	for (const name of ["Produtos e links", "Posts", "Métricas", "Flags", "Newsletter"]) {
		await expect(nav.getByRole("link", { name })).toBeVisible();
	}
	await expect(nav.getByRole("link", { name: "Métricas" })).toHaveAttribute("aria-current", "page");
	await page.getByRole("button", { name: "Recolher ou expandir o menu" }).click();
	await expect(page.locator("[data-slot=sidebar][data-state=collapsed]")).toHaveCount(1);
});
