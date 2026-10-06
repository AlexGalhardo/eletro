import { load } from "cheerio";

export type ScrapedSpec = { label: string; value: string };

export type ScrapedProduct = {
	name: string;
	/** Absolute URL of the product photo, or null when the block has none. */
	image: string | null;
	/** Source bullet lists. Kept for the editor's reference only: the draft builder never copies them. */
	pros: string[];
	cons: string[];
	specs: ScrapedSpec[];
};

export type ScrapedPost = {
	url: string;
	/** Headline of the source page. Only the topic is derived from it; the sentence itself is not reused. */
	title: string;
	/** First path segment of the source URL, which is the category on the source site. */
	section: string;
	products: ScrapedProduct[];
	/** Number of FAQ entries on the source page (the questions themselves are not kept). */
	faqCount: number;
};

/**
 * Braces and angle brackets would be read as Svelte code by mdsvex, so they never leave the parser.
 * Whitespace (including non-breaking spaces) collapses to single spaces.
 */
export function clean(text: string): string {
	return text
		.replace(/[{}<>]/g, "")
		.replace(/\s+/g, " ")
		.trim();
}

/**
 * Reads a review post of eletrosinter.com.br (WordPress, theme with `box-products` cards).
 * Pure: no network, no clock. Selectors are tied to that theme; a layout change yields zero products,
 * which callers must treat as a failure.
 */
export function parsePostHtml(html: string, url: string): ScrapedPost {
	const $ = load(html);
	const textOf = (selector: string, scope: ReturnType<typeof $>) =>
		scope
			.find(selector)
			.map((_, element) => clean($(element).text()))
			.get()
			.filter(Boolean);

	const products = $(".box-products")
		.map((_, card): ScrapedProduct => {
			// The pros/cons and the spec sheet are siblings of the card, up to the next product title.
			const rest = $(card).nextUntil(".titulo-numerado, .box-products");
			const src = $(card).find(".bp-image img").attr("src");

			const specs = rest
				.filter(".box-ficha-tecnica")
				.find("li")
				.map((_, item): ScrapedSpec => {
					const label = clean($(item).find("strong").first().text()).replace(/:$/, "");
					const text = clean($(item).text());
					return { label, value: clean(text.slice(text.indexOf(":") + 1)) };
				})
				.get()
				.filter((spec) => spec.label && spec.value);

			return {
				name: clean($(card).find(".bp-title").text()),
				image: src ? absolute(src, url) : null,
				pros: textOf(".pros li", rest),
				cons: textOf(".contras li", rest),
				specs,
			};
		})
		.get()
		.filter((product) => product.name);

	return {
		url,
		title: clean($("article h1").first().text() || $("h1").first().text()),
		section: new URL(url).pathname.split("/").filter(Boolean)[0] ?? "",
		products,
		faqCount: $("#rank-math-faq .rank-math-question").length,
	};
}

function absolute(src: string, base: string): string | null {
	try {
		return new URL(src, base).href;
	} catch {
		return null;
	}
}
