"use client";

import { useEffect } from "react";

interface SchemaMarkupProps {
	post: any;
	shareUrl: string;
}

export default function SchemaMarkup({ post, shareUrl }: SchemaMarkupProps) {
	useEffect(() => {
		const existingArticleScript = document.querySelector('script[data-schema="article"]');
		const existingFaqScript = document.querySelector('script[data-schema="faq"]');

		if (existingArticleScript) {
			existingArticleScript.remove();
		}

		if (existingFaqScript) {
			existingFaqScript.remove();
		}

		const baseUrl = process.env.NEXT_PUBLIC_APP_URL || "https://example.com";

		const coverImage = post.cover
			? post.cover.startsWith("http")
				? post.cover
				: `${baseUrl}${post.cover}`
			: undefined;

		const articleJsonLd = {
			"@context": "https://schema.org",
			"@type": "BlogPosting",
			headline: post.title,
			description: post.description,
			image: coverImage ? [coverImage] : undefined,
			datePublished: `${post.date}T08:00:00-03:00`,
			dateModified: `${post.updatedAt || post.date}T08:00:00-03:00`,
			author: {
				"@type": "Person",
				name: "Bruno Souza",
				url: baseUrl,
			},
			publisher: {
				"@type": "Organization",
				name: "eletroradar",
				logo: {
					"@type": "ImageObject",
					url: `${baseUrl}/logo.webp`,
				},
			},
			mainEntityOfPage: {
				"@type": "WebPage",
				"@id": shareUrl,
			},
			articleSection: post.category || "Blog",
			keywords: post.tags ? post.tags.join(", ") : undefined,
			wordCount: post.content ? post.content.split(/\s+/).length : undefined,
			timeRequired: post.readingTime ? `PT${post.readingTime.replace(" min read", "M")}` : "PT5M",
			inLanguage: "pt-BR",
			url: shareUrl,
		};

		const articleScript = document.createElement("script");
		articleScript.type = "application/ld+json";
		articleScript.dataset.schema = "article";
		articleScript.textContent = JSON.stringify(articleJsonLd, null, 2);
		document.head.appendChild(articleScript);

		if (post?.faqData && post.faqData.length > 0) {
			const faqJsonLd = {
				"@context": "https://schema.org",
				"@type": "FAQPage",
				mainEntity: post.faqData.map((faq: any) => ({
					"@type": "Question",
					name: faq.question,
					acceptedAnswer: {
						"@type": "Answer",
						text: faq.answer,
					},
				})),
			};

			const faqScript = document.createElement("script");
			faqScript.type = "application/ld+json";
			faqScript.dataset.schema = "faq";
			faqScript.textContent = JSON.stringify(faqJsonLd, null, 2);
			document.head.appendChild(faqScript);
		}

		return () => {
			const articleScriptToRemove = document.querySelector('script[data-schema="article"]');
			const faqScriptToRemove = document.querySelector('script[data-schema="faq"]');

			if (articleScriptToRemove) {
				articleScriptToRemove.remove();
			}

			if (faqScriptToRemove) {
				faqScriptToRemove.remove();
			}
		};
	}, [post, shareUrl]);

	return null;
}
