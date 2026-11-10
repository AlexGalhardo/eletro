import { absoluteUrl } from "#lib/seo/jsonld.ts";
import { site } from "#lib/site.config.ts";

export const prerender = true;

export function GET() {
	// robots.txt is a request, not a lock: well-behaved crawlers follow it, and nothing here stops the others.
	// Content-Signal (contentsignals.org) says what the pages may be used for by whoever reads them.
	const body = `# Scraping, bulk copying and model training are not allowed.
# Search engines and AI assistants may read the pages to answer questions, linking to the source.
User-agent: *
Content-Signal: search=yes, ai-input=yes, ai-train=no
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /preview

${site.blockedCrawlers.map((name) => `User-agent: ${name}`).join("\n")}
Disallow: /

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

	return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
