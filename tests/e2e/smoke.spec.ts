import { readdirSync, readFileSync } from "node:fs";
import { expect, test } from "@playwright/test";
import { isPublished, parsePost } from "../../src/lib/content/parse.ts";

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
			expect((await request.get(`/${slug}`)).status(), slug).toBe(404);
			expect((await request.get(`/api/v1/posts/${slug}`)).status(), slug).toBe(404);
			expect(sitemap, slug).not.toContain(`/${slug}</loc>`);
			expect(llms, slug).not.toContain(`/${slug})`);
		}
	});

	test("unknown URLs return 404", async ({ request }) => {
		expect((await request.get("/esta-pagina-nao-existe")).status()).toBe(404);
	});

	test("sitemap lists every post and no private path", async ({ request }) => {
		const xml = await (await request.get("/sitemap.xml")).text();

		for (const slug of slugs) expect(xml).toContain(`/${slug}</loc>`);
		expect(xml).not.toMatch(/\/admin|\/api/);
	});

	test("robots.txt blocks private areas and points to the sitemap", async ({ request }) => {
		const robots = await (await request.get("/robots.txt")).text();

		expect(robots).toContain("Disallow: /admin");
		expect(robots).toContain("Disallow: /api");
		expect(robots).toMatch(/Sitemap: https:\/\/.+\/sitemap\.xml/);
	});

	test("llms.txt indexes the posts and no private path", async ({ request }) => {
		const llms = await (await request.get("/llms.txt")).text();

		expect(llms).toMatch(/^# /);
		expect(llms.match(/^- \[/gm)?.length).toBeGreaterThanOrEqual(slugs.length);
		expect(llms).not.toMatch(/\/admin|\/api/);
	});

	test("API responses are never indexable", async ({ request }) => {
		const response = await request.post("/api/v1/contact", { data: {} });

		expect(response.status()).toBe(400);
		expect(response.headers()["x-robots-tag"]).toContain("noindex");
	});
});
