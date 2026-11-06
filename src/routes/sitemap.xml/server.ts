import { absoluteUrl } from "#lib/seo/jsonld.ts";
import { getPosts } from "#lib/server/content.ts";

export const prerender = true;

// Only public pages are listed. /admin and /api never belong here.
const STATIC_PATHS = ["/", "/sobre", "/contato", "/politica-de-privacidade", "/termos-de-uso"];

const escapeXml = (value: string) => value.replace(/&/g, "&amp;").replace(/</g, "&lt;");

export function GET() {
	const posts = getPosts();
	const latest = posts[0]?.date;

	const urls = [
		...STATIC_PATHS.map((path) => ({
			loc: absoluteUrl(path),
			lastmod: path === "/" ? latest : undefined,
		})),
		...posts.map((post) => ({ loc: absoluteUrl(`/${post.slug}`), lastmod: post.date })),
	];

	const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
	.map(
		({ loc, lastmod }) =>
			`\t<url><loc>${escapeXml(loc)}</loc>${lastmod ? `<lastmod>${lastmod}</lastmod>` : ""}</url>`,
	)
	.join("\n")}
</urlset>
`;

	return new Response(body, { headers: { "Content-Type": "application/xml" } });
}
