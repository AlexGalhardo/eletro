import { describe, expect, test } from "vitest";
import { offerTarget, specifiedDetails } from "./review.ts";
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
