"use client";

import { useEffect } from "react";

interface LandingSchemaMarkupProps {
	totalPosts: number;
	categories: Array<{ id: string; name: string }>;
	featuredPosts?: any[];
}

export default function LandingSchemaMarkup({ totalPosts, categories, featuredPosts = [] }: LandingSchemaMarkupProps) {
	useEffect(() => {
		const existingSchemas = document.querySelectorAll('script[data-schema^="landing-"]');
		existingSchemas.forEach((script) => script.remove());

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";
		const siteName = "eletroradar";

		const websiteSchema = {
			"@context": "https://schema.org",
			"@type": "WebSite",
			"@id": `${baseUrl}/#website`,
			name: siteName,
			url: baseUrl,
			description:
				"Reviews, dicas e análises de produtos eletrodomésticos para sua casa que cabem no seu orçamento.",
			inLanguage: "pt-BR",
			potentialAction: {
				"@type": "SearchAction",
				target: {
					"@type": "EntryPoint",
					urlTemplate: `${baseUrl}/?search={search_term_string}`,
				},
				"query-input": "required name=search_term_string",
			},
			publisher: {
				"@type": "Organization",
				"@id": `${baseUrl}/#organization`,
			},
		};

		const organizationSchema = {
			"@context": "https://schema.org",
			"@type": "Organization",
			"@id": `${baseUrl}/#organization`,
			name: siteName,
			url: baseUrl,
			logo: {
				"@type": "ImageObject",
				url: `${baseUrl}/logo.png`,
				width: 200,
				height: 60,
			},
			description:
				"Reviews, dicas e análises de produtos eletrodomésticos para sua casa que cabem no seu orçamento.",
			sameAs: [],
		};

		const webPageSchema = {
			"@context": "https://schema.org",
			"@type": "WebPage",
			"@id": `${baseUrl}/#webpage`,
			url: baseUrl,
			name: `${siteName} - Análises de Eletrodomésticos`,
			description:
				"Reviews, dicas e análises de produtos eletrodomésticos para sua casa que cabem no seu orçamento.",
			inLanguage: "pt-BR",
			isPartOf: {
				"@type": "WebSite",
				"@id": `${baseUrl}/#website`,
			},
			about: {
				"@type": "Organization",
				"@id": `${baseUrl}/#organization`,
			},
			primaryImageOfPage: {
				"@type": "ImageObject",
				url: `${baseUrl}/og-image.jpg`,
				width: 1200,
				height: 630,
			},
		};

		const breadcrumbSchema = {
			"@context": "https://schema.org",
			"@type": "BreadcrumbList",
			"@id": `${baseUrl}/#breadcrumb`,
			itemListElement: [
				{
					"@type": "ListItem",
					position: 1,
					name: "Início",
					item: {
						"@type": "WebPage",
						"@id": baseUrl,
						url: baseUrl,
					},
				},
			],
		};

		const itemListSchema = {
			"@context": "https://schema.org",
			"@type": "ItemList",
			"@id": `${baseUrl}/#itemlist`,
			url: baseUrl,
			name: "eletroradar",
			description:
				"Reviews, dicas e análises de produtos eletrodomésticos para sua casa que cabem no seu orçamento.",
			numberOfItems: totalPosts,
			itemListElement: featuredPosts.slice(0, 8).map((post, index) => ({
				"@type": "ListItem",
				position: index + 1,
				item: {
					"@type": "Article",
					"@id": `${baseUrl}/${post.slug}`,
					headline: post.title,
					description: post.description,
					url: `${baseUrl}/${post.slug}`,
					datePublished: `${post.date}T08:00:00-03:00`,
					dateModified: `${post.date}T08:00:00-03:00`,
					author: {
						"@type": "Organization",
						"@id": `${baseUrl}/#organization`,
					},
					publisher: {
						"@type": "Organization",
						"@id": `${baseUrl}/#organization`,
					},
					image: post.cover ? [post.cover.startsWith("http") ? post.cover : `${baseUrl}${post.cover}`] : [],
					articleSection: post.category || "reviews",
				},
			})),
		};

		const injectSchema = (schema: any, id: string) => {
			const script = document.createElement("script");
			script.type = "application/ld+json";
			script.dataset.schema = `landing-${id}`;
			script.textContent = JSON.stringify(schema, null, 2);
			document.head.appendChild(script);
		};

		injectSchema(websiteSchema, "website");
		injectSchema(organizationSchema, "organization");
		injectSchema(webPageSchema, "webpage");
		injectSchema(breadcrumbSchema, "breadcrumb");
		injectSchema(itemListSchema, "itemlist");

		return () => {
			const schemas = document.querySelectorAll('script[data-schema^="landing-"]');
			schemas.forEach((script) => script.remove());
		};
	}, [totalPosts, categories, featuredPosts]);

	return null;
}
