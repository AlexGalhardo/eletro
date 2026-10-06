import type { Post } from "../content/schema.ts";
import { type AuthorId, site } from "../site.config.ts";

type JsonLd = Record<string, unknown>;

/** Absolute URL for a site path or an already absolute URL. */
export function absoluteUrl(pathOrUrl: string): string {
	return /^https?:\/\//.test(pathOrUrl)
		? pathOrUrl
		: `${site.url}${pathOrUrl.startsWith("/") ? "" : "/"}${pathOrUrl}`;
}

// Posts carry a date only; search engines want a full timestamp.
const timestamp = (date: string) => `${date}T08:00:00-03:00`;

const organizationRef = { "@type": "Organization", "@id": `${site.url}/#organization` };

export function postJsonLd(post: Post): JsonLd[] {
	const url = absoluteUrl(`/${post.slug}`);
	const author = site.authors[post.author as AuthorId];

	const article: JsonLd = {
		"@context": "https://schema.org",
		"@type": "BlogPosting",
		headline: post.title,
		description: post.description,
		image: post.cover ? [absoluteUrl(post.cover)] : undefined,
		datePublished: timestamp(post.date),
		dateModified: timestamp(post.date),
		author: { "@type": "Person", name: author?.name ?? site.name, url: site.url },
		publisher: {
			"@type": "Organization",
			name: site.domain,
			logo: { "@type": "ImageObject", url: absoluteUrl(site.logo) },
		},
		mainEntityOfPage: { "@type": "WebPage", "@id": url },
		articleSection: post.category,
		wordCount: post.wordCount,
		timeRequired: `PT${post.readingMinutes}M`,
		inLanguage: site.locale,
		url,
	};

	if (post.faqData.length === 0) return [article];

	return [
		article,
		{
			"@context": "https://schema.org",
			"@type": "FAQPage",
			mainEntity: post.faqData.map((faq) => ({
				"@type": "Question",
				name: faq.question,
				acceptedAnswer: { "@type": "Answer", text: faq.answer },
			})),
		},
	];
}

export function homeJsonLd(posts: Post[]): JsonLd[] {
	return [
		{
			"@context": "https://schema.org",
			"@type": "WebSite",
			"@id": `${site.url}/#website`,
			name: site.name,
			url: site.url,
			description: site.longDescription,
			inLanguage: site.locale,
			publisher: organizationRef,
		},
		{
			"@context": "https://schema.org",
			"@type": "Organization",
			"@id": `${site.url}/#organization`,
			name: site.name,
			url: site.url,
			logo: { "@type": "ImageObject", url: absoluteUrl(site.logo) },
			description: site.longDescription,
		},
		{
			"@context": "https://schema.org",
			"@type": "ItemList",
			"@id": `${site.url}/#itemlist`,
			url: site.url,
			name: site.name,
			numberOfItems: posts.length,
			itemListElement: posts.slice(0, 8).map((post, index) => ({
				"@type": "ListItem",
				position: index + 1,
				url: absoluteUrl(`/${post.slug}`),
				name: post.title,
			})),
		},
	];
}

/** Serializes JSON-LD for inlining in HTML: `<` is escaped so content can never close the script tag. */
export function serializeJsonLd(data: JsonLd): string {
	return JSON.stringify(data).replace(/</g, "\\u003c");
}
