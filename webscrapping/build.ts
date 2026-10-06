import type { ScrapedPost, ScrapedProduct } from "./parse.ts";

/** The source cannot become a draft as it is. `message` is in Portuguese because it is shown to the editor. */
export class BuildError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "BuildError";
	}
}

export type DraftProduct = {
	id: string;
	name: string;
	/** Still the source URL: whoever stores the draft downloads it and swaps in the local path. */
	image: string | null;
	mercadolivreUrl: string;
	shopeeUrl: string;
	amazonUrl: string;
	advantages: string[];
	technicalDetails: { label: string; value: string }[];
};

export type Draft = {
	slug: string;
	/** Name of the product list, referenced by the body. */
	list: string;
	post: {
		title: string;
		description: string;
		date: string;
		category: string;
		cover: string;
		draft: true;
		ref: string;
		faqData: { question: string; answer: string }[];
		body: string;
	};
	products: DraftProduct[];
};

export type BuildOptions = {
	/** Category ids of the destination site. The source section must be one of them. */
	categories: readonly string[];
	/** Publication date of the draft, YYYY-MM-DD. */
	date: string;
	maxProducts?: number;
};

/** Stands in for every affiliate link until the admin pastes the real one. */
export const AFFILIATE_PLACEHOLDER = "#";

const SMALL_WORDS = new Set(["a", "o", "e", "de", "da", "do", "das", "dos", "em", "para", "com", "por"]);

export function slugify(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "");
}

/** "Melhor lava louças portátil: 10 opções para comprar" becomes "lava louças portátil". */
export function topicOf(scraped: Pick<ScrapedPost, "title" | "url">): string {
	const fromTitle = (scraped.title.split(/[:?|]| [-–] /)[0] ?? "")
		.replace(/^\s*(top\s+)?\d+\s+/i, "")
		.replace(/^\s*(qual\s+(é\s+)?)?(os|as|o|a)?\s*melhor(es)?\s+/i, "")
		.replace(/\s+qual\s+(é\s+)?(o|a)\s+melhor.*$/i, "")
		.trim()
		.toLowerCase();
	if (fromTitle && fromTitle.split(" ").length <= 6) return fromTitle;
	// The URL has no accents, but it is always short and on topic.
	return baseSlug(scraped.url).replaceAll("-", " ");
}

function baseSlug(url: string): string {
	const last = new URL(url).pathname.split("/").filter(Boolean).at(-1) ?? "";
	return slugify(last)
		.replace(/^melhor(es)?-/, "")
		.replace(/-qual-(e-)?(o|a)-melhor$/, "");
}

const titleCase = (text: string) =>
	text
		.split(" ")
		.map((word, index) =>
			index > 0 && SMALL_WORDS.has(word) ? word : word.charAt(0).toUpperCase() + word.slice(1),
		)
		.join(" ");

/** Labels most products share, with values short enough to compare in one sentence. */
function comparableLabels(products: ScrapedProduct[], limit: number): string[] {
	const labels = [...new Set(products.flatMap((product) => product.specs.map((spec) => spec.label)))];
	return labels
		.filter((label) => {
			const values = products.flatMap((product) =>
				product.specs.filter((spec) => spec.label === label).map((spec) => spec.value),
			);
			return (
				values.length >= Math.ceil(products.length / 2) && values.every((value) => value.length <= 40)
			);
		})
		.slice(0, limit);
}

const specValue = (product: ScrapedProduct, label: string) =>
	product.specs.find((spec) => spec.label === label)?.value;

/**
 * Turns scraped facts into a complete draft. Pure: no network, no clock.
 * Every sentence comes from a template over names and specs. The source prose (intro, descriptions,
 * pros and cons, FAQ) is never copied: that would be a copyright problem and duplicate content for SEO.
 * The text is deliberately generic; the editor is expected to rewrite it before publishing.
 */
export function buildDraft(scraped: ScrapedPost, options: BuildOptions): Draft {
	// The source writes "não especificado" for unknown values; a spec without a value says nothing.
	const products = scraped.products.slice(0, options.maxProducts ?? 7).map((product) => ({
		...product,
		specs: product.specs.filter((spec) => spec.value.toLowerCase() !== "não especificado"),
	}));
	if (products.length === 0)
		throw new BuildError("Nenhum produto foi encontrado na página. O layout da origem pode ter mudado.");
	if (!options.categories.includes(scraped.section))
		throw new BuildError(
			`A categoria "${scraped.section}" da origem não existe neste site (${options.categories.join(", ")}).`,
		);

	const base = baseSlug(scraped.url);
	if (base.length < 3) throw new BuildError("Não foi possível derivar um slug do endereço informado.");
	const slug = `melhor-${base}`.slice(0, 96).replace(/-+$/, "");

	const topic = topicOf(scraped);
	const count = products.length;
	const names = products.map((product) => product.name);
	const compared = comparableLabels(products, 2);
	const year = options.date.slice(0, 4);

	const usedIds = new Set<string>();
	const draftProducts = products.map((product, index): DraftProduct => {
		let id = slugify(product.name) || `produto-${index + 1}`;
		if (usedIds.has(id)) id = `${id}-${index + 1}`;
		usedIds.add(id);
		return {
			id,
			name: product.name,
			image: product.image,
			mercadolivreUrl: AFFILIATE_PLACEHOLDER,
			shopeeUrl: AFFILIATE_PLACEHOLDER,
			amazonUrl: AFFILIATE_PLACEHOLDER,
			// Placeholder advantages restate the shortest specs; the source bullets are not reused.
			advantages: product.specs
				.filter((spec) => spec.value.length <= 60)
				.slice(0, 5)
				.map((spec) => `${spec.label}: ${spec.value}`),
			technicalDetails: product.specs,
		};
	});

	const faqData = [
		{
			question: `Quais modelos de ${topic} aparecem nesta comparação?`,
			answer: `A lista reúne ${count} modelos: ${names.join("; ")}. Cada um traz a ficha técnica informada pelo fabricante ou pelo vendedor, para comparar lado a lado antes da compra.`,
		},
		...compared.map((label) => ({
			question: `Como os modelos de ${topic} se comparam em ${label.toLowerCase()}?`,
			answer: `${products
				.filter((product) => specValue(product, label))
				.map((product) => `${product.name}: ${specValue(product, label)}`)
				.join("; ")}.`,
		})),
	];

	const sections = products.map((product, index) =>
		[
			`### ${index + 1}. ${product.name}`,
			`Dados informados para o ${product.name}:`,
			product.specs.map((spec) => `- **${spec.label}:** ${spec.value}`).join("\n") ||
				"- Ficha técnica não informada na origem.",
		].join("\n\n"),
	);

	const body = [
		`Comparar ${topic} pede atenção à ficha técnica, e não só ao preço.`,
		"Escolher sem conferir medidas, capacidade e tensão costuma terminar em devolução ou em um aparelho que não atende à rotina da casa.",
		`Esta seleção reúne ${count} modelos, com os dados técnicos de cada um organizados no mesmo formato.`,
		"Confira os cartões a seguir e, depois, o detalhamento de cada produto.",
		`<CardsTable list="${slug}" />`,
		"## Ficha técnica de cada modelo",
		...sections,
		"## Perguntas Frequentes",
		...faqData.flatMap((item) => [`### ${item.question}`, item.answer]),
	].join("\n\n");

	return {
		slug,
		list: slug,
		post: {
			title: `Melhor ${titleCase(topic)}: ${count} Modelos em ${year}`,
			description: `Compare ${count} modelos de ${topic} pela ficha técnica${
				compared.length > 0 ? `: ${compared.join(" e ").toLowerCase()}` : ""
			}.`,
			date: options.date,
			category: scraped.section,
			cover: "",
			draft: true,
			ref: scraped.url,
			faqData,
			body,
		},
		products: draftProducts,
	};
}
