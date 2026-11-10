import { describe, expect, it } from "vitest";
import { getPosts } from "../../src/lib/server/content.ts";
import { site } from "../../src/lib/site.config.ts";
import { GET as llms } from "../../src/routes/llms.txt/server.ts";
import { GET as robots } from "../../src/routes/robots.txt/server.ts";
import { GET as sitemap } from "../../src/routes/sitemap.xml/server.ts";

describe("public crawl files", () => {
	it("lists published posts and keeps /admin and /api out of the sitemap, robots allow list and llms.txt", async () => {
		const posts = getPosts();
		expect(posts.length).toBeGreaterThan(0);
		const sample = posts[0];
		if (!sample) throw new Error("no published post");

		const sitemapBody = await (await sitemap()).text();
		expect(sitemapBody).toContain(`https://eletroradar.com.br/${sample.slug}/</loc>`);
		expect(sitemapBody).not.toContain(`https://eletroradar.com.br/${sample.slug}</loc>`);
		expect(sitemapBody).not.toContain("/admin");
		expect(sitemapBody).not.toContain("/api");

		const robotsBody = await (await robots()).text();
		expect(robotsBody).toContain("Disallow: /admin");
		expect(robotsBody).toContain("Disallow: /api");
		expect(robotsBody).toContain("Disallow: /preview");
		expect(robotsBody).toContain(`Sitemap: ${site.url}/sitemap.xml`);

		const llmsBody = await (await llms()).text();
		expect(llmsBody).toContain(sample.title);
		expect(llmsBody).not.toContain("/admin");
		expect(llmsBody).not.toContain("/api/");
	});
});
