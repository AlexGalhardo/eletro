import { describe, expect, it } from "vitest";
import { contentImages, linkedProducts, postField, setPostField } from "./post-fields.ts";

describe("post editor fields", () => {
	it("updates publication fields while keeping the body and other metadata", () => {
		const original =
			'---\ntitle: "Old"\ndate: "2026-11-01"\nfaqData:\n  - question: "Q"\n    answer: "A"\n---\n\n<CardsTable list="airfryers-8-litros" />';
		const updated = setPostField(setPostField(original, "date", "2026-12-01"), "draft", "true");
		expect(postField(updated, "date")).toBe("2026-12-01");
		expect(postField(updated, "draft")).toBe("true");
		expect(updated).toContain('question: "Q"');
		expect(updated).toContain('<CardsTable list="airfryers-8-litros" />');
	});

	it("finds product links and image references", () => {
		const raw =
			'<CardsTable list="airfryers-8-litros" />\n<img src="/images/posts/item.webp" />\ncover: "/images/covers/cover.webp"';
		expect(linkedProducts(raw)).toEqual(["airfryers-8-litros"]);
		expect(contentImages(raw)).toEqual(["/images/posts/item.webp", "/images/covers/cover.webp"]);
	});
});
