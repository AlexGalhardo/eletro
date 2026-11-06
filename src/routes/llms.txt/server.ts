import { absoluteUrl } from "#lib/seo/jsonld.ts";
import { getPosts } from "#lib/server/content.ts";
import { site } from "#lib/site.config.ts";

export const prerender = true;

/** https://llmstxt.org — a Markdown index of the public content for language models. */
export function GET() {
	const sections = site.categories
		.map((category) => {
			const posts = getPosts().filter((post) => post.category === category.id);
			if (posts.length === 0) return "";
			const links = posts.map(
				(post) => `- [${post.title}](${absoluteUrl(`/${post.slug}`)}): ${post.description}`,
			);
			return `## ${category.label}\n\n${links.join("\n")}\n`;
		})
		.filter(Boolean);

	const body = `# ${site.name}

> ${site.longDescription}

${site.contentPolicy}

${sections.join("\n")}
## Institucional

- [Sobre](${absoluteUrl("/sobre")})
- [Contato](${absoluteUrl("/contato")})
- [Política de Privacidade](${absoluteUrl("/politica-de-privacidade")})
- [Termos de Uso](${absoluteUrl("/termos-de-uso")})
`;

	return new Response(body, { headers: { "Content-Type": "text/plain; charset=utf-8" } });
}
