import { readdirSync, readFileSync } from "node:fs";
import { isPublished, parsePost } from "../../src/lib/content/parse.ts";
import { site } from "../../src/lib/site.config.ts";
import { expect, test } from "./test.ts";

// Fast checks over HTTP only: every public URL answers and nothing private leaks into the indexes.
const posts = readdirSync("content/posts").map((file) => {
	const slug = file.replace(/\.mdx$/, "");
	return {
		slug,
		published: isPublished(parsePost(slug, readFileSync(`content/posts/${file}`, "utf8")).post),
	};
});
const slugs = posts.filter((post) => post.published).map((post) => post.slug);
// Drafts and scheduled posts live in the repository but must not exist on the site.
const hidden = posts.filter((post) => !post.published).map((post) => post.slug);
// Read as a file: Playwright runs this spec in plain Node, which needs an import attribute for JSON.
const { previewDrafts } = JSON.parse(readFileSync("content/flags.json", "utf8")) as {
	previewDrafts: boolean;
};
const pages = ["/", "/sobre", "/contato", "/politica-de-privacidade", "/termos-de-uso"];

test.describe("smoke", () => {
	test.skip(({ isMobile }) => isMobile, "HTTP-only checks do not depend on the viewport");

	for (const path of pages) {
		test(`${path} responds with a titled, canonical page`, async ({ request }) => {
			const response = await request.get(path);
			const html = await response.text();

			expect(response.status()).toBe(200);
			expect(html).toMatch(/<title>[^<]+<\/title>/);
			expect(html).toContain('<html lang="pt-BR"');
			expect(html).toMatch(/<link rel="canonical" href="https:\/\/[^"]+"/);
		});
	}

	test("every post is published with its title, structured data and product cards", async ({ request }) => {
		expect(slugs.length).toBeGreaterThanOrEqual(64);

		for (const slug of slugs) {
			const response = await request.get(`/${slug}`);
			const html = await response.text();

			expect(response.status(), slug).toBe(200);
			expect(html, slug).toContain(`${site.url}/${slug}/`);
			expect(html, slug).toContain('"@type":"BlogPosting"');
			expect(html, slug).toContain('"@type":"FAQPage"');
			expect(html, slug).toContain('data-testid="cards-table"');
			expect(html, slug).not.toContain("Nenhum produto encontrado");
		}
	});

	test("drafts and scheduled posts are not served, listed or exposed by the API", async ({ request }) => {
		const sitemap = await (await request.get("/sitemap.xml")).text();
		const llms = await (await request.get("/llms.txt")).text();

		for (const slug of hidden) {
			const page = await request.get(`/${slug}`);
			expect(page.status(), slug).toBe(404);
			expect(await page.text(), slug).toContain("Página Não Encontrada");
			expect((await request.get(`/api/v1/posts/${slug}/index.json`)).status(), slug).toBe(404);
			expect(sitemap, slug).not.toContain(`/${slug}/</loc>`);
			expect(sitemap, slug).not.toContain(`/${slug}</loc>`);
			expect(llms, slug).not.toContain(`/${slug}/)`);
			expect(llms, slug).not.toContain(`/${slug})`);
		}
	});

	test("drafts have a noindex preview that no index lists, and /admin/flags lists them", async ({
		request,
	}) => {
		test.skip(!previewDrafts, "previewDrafts is off in content/flags.json");
		const sitemap = await (await request.get("/sitemap.xml")).text();
		const llms = await (await request.get("/llms.txt")).text();
		expect(sitemap).not.toContain("/preview/");
		expect(llms).not.toContain("/preview/");

		const flags = await (await request.get("/admin/flags")).text();
		for (const slug of hidden) {
			const page = await request.get(`/preview/${slug}`);
			expect(page.status(), slug).toBe(200);
			expect(await page.text(), slug).toMatch(/<meta name="robots" content="noindex/);
			expect(flags, slug).toContain(`/preview/${slug}`);
		}
	});

	test("unknown pages are a 404; missing files and API routes stay 404", async ({ request }) => {
		const page = await request.get("/esta-pagina-nao-existe");
		expect(page.status()).toBe(404);
		expect(await page.text()).toContain("Página Não Encontrada");

		expect((await request.get("/images/nao-existe.webp", { maxRedirects: 0 })).status()).toBe(404);
		expect((await request.get("/api/v1/nao-existe/index.json", { maxRedirects: 0 })).status()).toBe(404);
	});

	test("sitemap lists every post and no private path", async ({ request }) => {
		const xml = await (await request.get("/sitemap.xml")).text();

		for (const slug of slugs) expect(xml).toContain(`/${slug}/</loc>`);
		expect(xml).not.toMatch(/\/admin|\/api/);
	});

	test("robots.txt blocks private areas and points to the sitemap", async ({ request }) => {
		const robots = await (await request.get("/robots.txt")).text();

		expect(robots).toContain("Disallow: /admin");
		expect(robots).toContain("Disallow: /api");
		expect(robots).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
	});

	test("robots.txt refuses training crawlers and lets search and assistants read", async ({ request }) => {
		const robots = await (await request.get("/robots.txt")).text();

		expect(robots).toContain(
			"User-agent: *\nContent-Signal: search=yes, ai-input=yes, ai-train=no\nAllow: /",
		);
		expect(robots).toMatch(/User-agent: GPTBot\n(User-agent: .+\n)*Disallow: \/\n/);
		expect(robots).not.toMatch(/User-agent: (Googlebot|OAI-SearchBot|ChatGPT-User|PerplexityBot)/);
	});

	test("llms.txt indexes the posts and no private path", async ({ request }) => {
		const llms = await (await request.get("/llms.txt")).text();

		expect(llms).toMatch(/^# /);
		expect(llms.match(/^- \[/gm)?.length).toBeGreaterThanOrEqual(slugs.length);
		expect(llms).not.toMatch(/\/admin|\/api/);
	});

	test("public API reads are JSON files", async ({ request }) => {
		// GitHub Pages serves `index.json` as application/json for the directory URL too.
		// `astro preview` only does that for the file path, which is the same artifact.
		const health = await request.get("/api/v1/health/index.json");
		expect(health.status()).toBe(200);
		expect(health.headers()["content-type"]).toContain("application/json");
		expect((await health.json()).data.status).toBe("ok");

		const one = slugs[0];
		expect(one).toBeTruthy();
		const post = await request.get(`/api/v1/posts/${one}/index.json`);
		expect(post.status()).toBe(200);
		expect(post.headers()["content-type"]).toContain("application/json");
		expect((await post.json()).data.slug).toBe(one);
	});
});
