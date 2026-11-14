import { describe, expect, test } from "vitest";
import { comparisonColumns, offerTarget, pickTopProduct, specifiedDetails } from "./review.ts";
import type { Product } from "./schema.ts";

const product = (id: string, extra: Partial<Product> & Record<string, unknown> = {}): Product => ({
	id,
	name: `Produto ${id}`,
	image: "#",
	mercadolivreUrl: `https://meli.la/${id}`,
	advantages: [],
	technicalDetails: [],
	...extra,
});

const detail = (label: string, value = "x") => ({ label, value });

describe("pickTopProduct", () => {
	test("prefers the best score over the badge and the order", () => {
		const list = [
			product("a", { badge: "nossa escolha" }),
			product("b", { score: 7 }),
			product("c", { score: 9.2 }),
		];
		expect(pickTopProduct(list)?.id).toBe("c");
	});

	test("falls back to the 'nossa escolha' badge, then to the first product", () => {
		expect(pickTopProduct([product("a"), product("b", { badge: "Nossa escolha" })])?.id).toBe("b");
		expect(pickTopProduct([product("a"), product("b")])?.id).toBe("a");
	});

	test("ignores products without a real store link", () => {
		const list = [product("a", { mercadolivreUrl: "#", score: 10 }), product("b")];
		expect(pickTopProduct(list)?.id).toBe("b");
		expect(pickTopProduct([product("a", { mercadolivreUrl: null })])).toBeUndefined();
	});
});

describe("comparisonColumns", () => {
	test("keeps only labels filled in by two or more products, most common first, up to five", () => {
		const list = [
			product("a", { technicalDetails: [detail("Peso"), detail("Potência"), detail("Cor")] }),
			product("b", {
				technicalDetails: [detail("Potência"), detail("Peso"), detail("Cor"), detail("Selo")],
			}),
			product("c", { technicalDetails: [detail("Potência"), detail("Voltagem", "não especificado")] }),
		];
		expect(comparisonColumns(list)).toEqual(["Potência", "Peso", "Cor"]);
	});

	test("is empty when nothing is shared", () => {
		expect(
			comparisonColumns([product("a", { technicalDetails: [detail("Peso")] }), product("b")]),
		).toEqual([]);
	});
});

test("specifiedDetails drops empty and 'não especificado' values", () => {
	const p = product("a", {
		technicalDetails: [detail("A", ""), detail("B", "Não especificado"), detail("C", "1")],
	});
	expect(specifiedDetails(p).map((d) => d.label)).toEqual(["C"]);
});

describe("offerTarget", () => {
	test("goes through the dashboard and keeps the direct store address", () => {
		const target = offerTarget("post", product("a", { amazonUrl: "https://amzn.to/a" }), "amazon");
		expect(target.direct).toBe("https://amzn.to/a");
		expect(target.dashboard).toContain("store=amazon");
		expect(target.store).toBe("amazon");
	});

	test("uses the site-wide offer when the product has no link", () => {
		const target = offerTarget("post", product("a", { mercadolivreUrl: null }));
		expect(target.store).toBe("mercadolivre");
		expect(target.dashboard).toContain("ofertas");
	});
});
