import { describe, expect, it } from "vitest";
import { linkCounts, postStatusMarkdown, postStatusRow } from "./post-status.ts";

describe("post status", () => {
	it("counts real links and # placeholders, ignoring null", () => {
		expect(
			linkCounts([
				{ mercadolivreUrl: "https://meli.la/x", amazonUrl: "#", shopeeUrl: null },
				{ mercadolivreUrl: "#", amazonUrl: "#", shopeeUrl: "#" },
			]),
		).toEqual({ links: 1, pending: 4 });
	});

	it("sums the products of every list the post shows", () => {
		const lists = new Map([
			["a", [{ mercadolivreUrl: "https://meli.la/a" }]],
			["b", [{ amazonUrl: "#" }, { shopeeUrl: "https://s.shopee.com.br/b" }]],
		]);
		const post = { slug: "melhor-x", title: "X", category: "cozinha", draft: true };
		expect(postStatusRow(post, ["a", "b", "missing"], lists)).toEqual({
			...post,
			products: 3,
			links: 2,
			pending: 1,
		});
	});

	it("renders a sorted table with totals and escaped pipes", () => {
		const row = { category: "cozinha", products: 1, links: 1, pending: 2 };
		const markdown = postStatusMarkdown([
			{ ...row, slug: "melhor-b", title: "B | C", draft: true },
			{ ...row, slug: "melhor-a", title: "A", draft: false },
		]);
		expect(markdown).toContain("Total: 2 posts, 1 fora de rascunho, 1 rascunhos,");
		expect(markdown).toContain("2 links de afiliado e 4 pendentes.");
		expect(markdown.indexOf("melhor-a")).toBeLessThan(markdown.indexOf("melhor-b"));
		expect(markdown).toContain("| B \\| C | cozinha | true | 1 | 1 | 2 |");
	});
});
