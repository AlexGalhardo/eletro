import { describe, expect, it } from "vitest";
import { isPublished, parsePost, referencedLists, serializePost } from "./parse.ts";

const raw = `---
title: "Melhor Air Fryer"
description: "Resumo"
date: "2026-09-04"
category: "cozinha"
cover: "/images/covers/a.webp"
draft: false
author: "ana"
faqData:
  [
    { question: "Serve para 4 pessoas?", answer: "Sim." },
  ]
---

Texto de abertura com algumas palavras.

<CardsTable list="airfryers-8-litros" />
`;

describe("parsePost", () => {
	it("reads frontmatter, including flow-style FAQ, and derives reading stats", () => {
		const { post, body } = parsePost("melhor-air-fryer", raw);

		expect(post).toMatchObject({
			slug: "melhor-air-fryer",
			title: "Melhor Air Fryer",
			category: "cozinha",
			author: "ana",
			draft: false,
			readingMinutes: 1,
		});
		expect(post.faqData).toEqual([{ question: "Serve para 4 pessoas?", answer: "Sim." }]);
		expect(post.wordCount).toBeGreaterThan(5);
		expect(body).toContain("<CardsTable");
	});

	it("fills defaults for optional fields", () => {
		const { post } = parsePost("x", `---\ntitle: T\ndate: "2026-01-01"\ncategory: cozinha\n---\nbody`);

		expect(post).toMatchObject({
			draft: false,
			author: "bruno",
			faqData: [],
			cover: "",
			description: "",
		});
	});

	it("names the post and the field when frontmatter is invalid", () => {
		expect(() =>
			parsePost("quebrado", `---\ntitle: T\ndate: "04/09/2026"\ncategory: cozinha\n---\n`),
		).toThrow(/quebrado.*date/s);
		expect(() =>
			parsePost("quebrado", `---\ntitle: T\ndate: "2026-01-01"\ncategory: nada\n---\n`),
		).toThrow(/category/);
	});
});

describe("serializePost", () => {
	it("round-trips through parsePost without losing data", () => {
		const first = parsePost("a", raw);
		const { slug: _slug, wordCount: _words, readingMinutes: _minutes, ...frontmatter } = first.post;

		const second = parsePost("a", serializePost(frontmatter, first.body));

		expect(second.post).toEqual(first.post);
		expect(second.body.trim()).toBe(first.body.trim());
	});
});

describe("isPublished", () => {
	const now = new Date("2026-09-04T15:00:00Z");

	it("publishes on the post date and hides future posts and drafts", () => {
		expect(isPublished({ draft: false, date: "2026-09-04" }, now)).toBe(true);
		expect(isPublished({ draft: false, date: "2026-09-05" }, now)).toBe(false);
		expect(isPublished({ draft: true, date: "2026-01-01" }, now)).toBe(false);
	});
});

describe("referencedLists", () => {
	it("finds every list used in the body", () => {
		expect(referencedLists(`a\n<CardsTable list="um" />\nb\n<CardsTable  list="dois"/>`)).toEqual([
			"um",
			"dois",
		]);
		expect(referencedLists("sem componentes")).toEqual([]);
	});
});
