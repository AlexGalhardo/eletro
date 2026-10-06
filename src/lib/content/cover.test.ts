import { describe, expect, it } from "vitest";
import { coverSrcset, coverVariant, coverWidths } from "./cover.ts";

describe("cover variants", () => {
	it("maps a local cover to its resized copies", () => {
		expect(coverVariant("/images/covers/capa.webp", 480)).toBe("/images/covers/w480/capa.webp");
		expect(coverVariant("/images/covers/Foto_1.JPG", 1280)).toBe("/images/covers/w1280/Foto_1.webp");
	});

	it("has no copies for an external or empty cover, nor for a file in another folder", () => {
		expect(coverVariant("https://cdn.example.com/capa.webp", 480)).toBeUndefined();
		expect(coverVariant("", 480)).toBeUndefined();
		expect(coverVariant("/images/covers/w480/capa.webp", 480)).toBeUndefined();
		expect(coverVariant("/images/posts/produto.webp", 480)).toBeUndefined();
	});

	it("knows which copies exist and builds the srcset from them", () => {
		const smallOnly = (url: string) => url.includes("/w480/");

		expect(coverWidths("/images/covers/capa.webp", () => true)).toEqual([480, 768, 1280]);
		expect(coverWidths("/images/covers/capa.webp", smallOnly)).toEqual([480]);
		expect(coverWidths("/images/covers/capa.webp", () => false)).toEqual([]);
		expect(coverWidths("https://cdn.example.com/capa.webp", () => true)).toEqual([]);

		expect(coverSrcset("/images/covers/capa.webp", [480, 768, 1280])).toBe(
			"/images/covers/w480/capa.webp 480w, /images/covers/w768/capa.webp 768w, /images/covers/w1280/capa.webp 1280w",
		);
		expect(coverSrcset("/images/covers/capa.webp", [480])).toBe("/images/covers/w480/capa.webp 480w");
		expect(coverSrcset("/images/covers/capa.webp", [])).toBeUndefined();
	});
});
