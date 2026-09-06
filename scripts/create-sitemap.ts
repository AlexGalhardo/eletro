import fs from "node:fs";
import path from "node:path";

interface SitemapUrl {
	loc: string;
	lastmod: string;
	changefreq: string;
	priority: string;
}

const staticUrls: SitemapUrl[] = [
	{
		loc: "https://example.com",
		lastmod: "2026-07-12T12:00:00.000Z",
		changefreq: "monthly",
		priority: "1.0",
	},
	{
		loc: "https://example.com/politica-de-privacidade",
		lastmod: "2026-07-12T12:00:00.000Z",
		changefreq: "monthly",
		priority: "0.8",
	},
	{
		loc: "https://example.com/contato",
		lastmod: "2026-07-12T12:00:00.000Z",
		changefreq: "monthly",
		priority: "0.8",
	},
	{
		loc: "https://example.com/sobre",
		lastmod: "2026-07-12T12:00:00.000Z",
		changefreq: "monthly",
		priority: "0.8",
	},
	{
		loc: "https://example.com/termos-de-uso",
		lastmod: "2026-07-12T12:00:00.000Z",
		changefreq: "monthly",
		priority: "0.8",
	},
];

function generateSitemap(): void {
	const contentDir = path.join(process.cwd(), "app", "[slug]", "content");
	const contentUrls: SitemapUrl[] = [];

	if (!fs.existsSync(contentDir)) {
		console.error(`Error: Content directory not found at ${contentDir}`);
		return;
	}

	const files = fs.readdirSync(contentDir);

	files.forEach((file) => {
		if (file.endsWith(".mdx")) {
			const slug = file.replace(".mdx", "");
			contentUrls.push({
				loc: `https://example.com/${slug}`,
				lastmod: "2026-07-12T12:00:00.000Z",
				changefreq: "monthly",
				priority: "0.8",
			});
		}
	});

	const allUrls = [...staticUrls, ...contentUrls];

	const urlElements = allUrls
		.map(
			(url) => `  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
		)
		.join("\n\n");

	const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml"
        xmlns:mobile="http://www.google.com/schemas/sitemap-mobile/1.0"
        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
        xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

${urlElements}

</urlset>`;

	const outputPath = path.join(process.cwd(), "public", "sitemap.xml");
	fs.writeFileSync(outputPath, sitemap, "utf-8");

	console.log(`✅ Sitemap generated successfully!`);
	console.log(`📊 Total URLs: ${allUrls.length}`);
	console.log(`   - Static URLs: ${staticUrls.length}`);
	console.log(`   - Content URLs: ${contentUrls.length}`);
	console.log(`📁 Location: ${outputPath}`);
}

generateSitemap();
