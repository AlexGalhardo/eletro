import { describe, expect, it } from "vitest";
import { locsOf, normalizeUrl, refOf } from "./batch.ts";

describe("batch import helpers", () => {
	it("treats slash, www and case variants as the same page", () => {
		expect(normalizeUrl("https://www.Eletrosinter.com.br/cozinha/mixer/")).toBe(
			normalizeUrl("https://eletrosinter.com.br/cozinha/mixer"),
		);
	});

	it("reads every <loc> of a sitemap", () => {
		const xml =
			"<urlset><url><loc>https://a.br/x/</loc></url><url><loc> https://a.br/y </loc></url></urlset>";
		expect(locsOf(xml)).toEqual(["https://a.br/x/", "https://a.br/y"]);
	});

	it("reads ref with single, double or no quotes", () => {
		const url = "https://eletrosinter.com.br/cozinha/mixer/";
		const post = (ref: string) => `---\ntitle: x\nref: ${ref}\n---\nbody`;
		expect(refOf(post(`'${url}'`))).toBe(url);
		expect(refOf(post(`"${url}"`))).toBe(url);
		expect(refOf(post(url))).toBe(url);
		expect(refOf(post(`>-\n  ${url}`))).toBe(url);
		expect(refOf("---\ntitle: x\n---\n")).toBeUndefined();
	});
});
