import { absoluteUrl } from "#lib/seo/jsonld.ts";

export const prerender = true;

export function GET() {
	const body = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /api

Sitemap: ${absoluteUrl("/sitemap.xml")}
`;

	return new Response(body, { headers: { "Content-Type": "text/plain" } });
}
