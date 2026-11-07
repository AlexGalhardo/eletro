import { describe, expect, it } from "vitest";
import type { Post } from "../content/schema.ts";
import { formatDate, readingTimeLabel } from "../format.ts";
import { site } from "../site.config.ts";
import { absoluteUrl, homeJsonLd, postJsonLd, serializeJsonLd } from "./jsonld.ts";

const post: Post = {
	slug: "melhor-ventilador",
	title: "Melhor Ventilador",
	description: "Resumo",
	date: "2026-09-04",
	category: "climatizacao",
	cover: "/images/covers/v.webp",
	draft: false,
	author: "ana",
	faqData: [{ question: "Gasta muito?", answer: "Não." }],
	wordCount: 450,
	readingMinutes: 3,
};

describe("absoluteUrl", () => {
	it("prefixes site paths and keeps absolute URLs", () => {
		expect(absoluteUrl("/sobre")).toBe(`${site.url}/sobre/`);
		expect(absoluteUrl("sobre")).toBe(`${site.url}/sobre/`);
		expect(absoluteUrl("/sitemap.xml")).toBe(`${site.url}/sitemap.xml`);
		expect(absoluteUrl("/logo.png")).toBe(`${site.url}/logo.png`);
		expect(absoluteUrl("/#organization")).toBe(`${site.url}/#organization`);
		expect(absoluteUrl("https://cdn.example.com/a.png")).toBe("https://cdn.example.com/a.png");
	});
});

describe("postJsonLd", () => {
	it("describes the article with its real author and absolute image", () => {
		const [article] = postJsonLd(post);

		expect(article).toMatchObject({
			"@type": "BlogPosting",
			headline: "Melhor Ventilador",
			url: `${site.url}/melhor-ventilador/`,
			image: [`${site.url}/images/covers/v.webp`],
			datePublished: "2026-09-04T08:00:00-03:00",
			timeRequired: "PT3M",
			author: { name: "Ana Souza" },
		});
	});

	it("adds a FAQPage only when the post has questions", () => {
		expect(postJsonLd(post)[1]).toMatchObject({
			"@type": "FAQPage",
			mainEntity: [{ name: "Gasta muito?", acceptedAnswer: { text: "Não." } }],
		});
		expect(postJsonLd({ ...post, faqData: [] })).toHaveLength(1);
	});
});

describe("homeJsonLd", () => {
	it("lists at most eight posts", () => {
		const posts = Array.from({ length: 12 }, (_, index) => ({ ...post, slug: `p-${index}` }));
		const itemList = homeJsonLd(posts).find((entry) => entry["@type"] === "ItemList");

		expect(itemList).toMatchObject({ numberOfItems: 12 });
		expect(itemList?.itemListElement).toHaveLength(8);
	});
});

describe("serializeJsonLd", () => {
	it("cannot close the surrounding script tag", () => {
		const output = serializeJsonLd({ name: "</script><script>alert(1)</script>" });

		expect(output).not.toContain("<");
		expect(JSON.parse(output)).toEqual({ name: "</script><script>alert(1)</script>" });
	});
});

describe("format", () => {
	it("formats dates in the site locale without shifting the day", () => {
		expect(formatDate("2026-09-04")).toBe("4 de setembro de 2026");
		expect(formatDate("2026-01-01")).toBe("1 de janeiro de 2026");
	});

	it("pluralizes the reading time", () => {
		expect(readingTimeLabel(1)).toBe("1 minuto de leitura");
		expect(readingTimeLabel(4)).toBe("4 minutos de leitura");
	});
});
