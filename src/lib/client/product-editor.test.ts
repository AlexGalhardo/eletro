import { describe, expect, it } from "vitest";
import { overlayProduct } from "#lib/client/product-editor.ts";
import type { Product } from "#lib/content/schema.ts";

const base = {
	id: "cafeteira",
	name: "Cafeteira",
	image: "/images/posts/a.webp",
	mercadolivreUrl: null,
	shopeeUrl: "https://shopee.com.br/a",
	amazonUrl: "",
	advantages: ["Rápida"],
	technicalDetails: [{ label: "Voltagem", value: "127V" }],
	ref: "kept",
} as Product;

describe("overlayProduct", () => {
	it("keeps unknown keys and an untouched null store link", () => {
		const next = overlayProduct(base, {
			id: "",
			name: "Cafeteira Nova",
			image: "/images/posts/a.webp",
			advantages: ["Rápida"],
			technicalDetails: [{ label: "Voltagem", value: "220V" }],
			stores: { mercadolivreUrl: "", shopeeUrl: "https://shopee.com.br/a", amazonUrl: "" },
		});

		expect(next.id).toBe("cafeteira-nova");
		expect(next.mercadolivreUrl).toBeNull();
		expect(next.shopeeUrl).toBe("https://shopee.com.br/a");
		expect(next.technicalDetails).toEqual([{ label: "Voltagem", value: "220V" }]);
		expect(next).toMatchObject({ ref: "kept" });
	});

	it("writes a store link the editor changed, including clearing one", () => {
		const next = overlayProduct(base, {
			id: "cafeteira",
			name: "Cafeteira",
			image: "/images/posts/a.webp",
			advantages: [],
			technicalDetails: [],
			stores: { mercadolivreUrl: "https://www.mercadolivre.com.br/a", shopeeUrl: "", amazonUrl: "" },
		});

		expect(next.mercadolivreUrl).toBe("https://www.mercadolivre.com.br/a");
		expect(next.shopeeUrl).toBe("");
	});
});
