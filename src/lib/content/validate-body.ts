import { CONTENT_COMPONENTS } from "./mdx-preprocess.ts";

/** Tags that run code, load something from elsewhere, submit data or redirect the page. */
const FORBIDDEN_TAGS = [
	"script",
	"style",
	"iframe",
	"object",
	"embed",
	"base",
	"meta",
	"link",
	"form",
	"button",
	"input",
	"textarea",
	"select",
	"svg",
	"math",
	"template",
	"noscript",
];
const FORBIDDEN_TAG = new RegExp(`<\\s*\\/?\\s*(${FORBIDDEN_TAGS.join("|")})\\b`, "i");

/** The only character references a post needs. Anything else could spell a brace, a colon or a letter. */
const ALLOWED_ENTITIES = [
	"amp",
	"lt",
	"gt",
	"quot",
	"apos",
	"nbsp",
	"mdash",
	"ndash",
	"hellip",
	"copy",
	"reg",
	"deg",
];

const ENCODED_BRACE = /&#0*12[35]|&#x0*7[bd]|&(?:lbrace|rbrace|lcub|rcub)|%7[bd]/i;

/** A `javascript:`, `vbscript:` or `data:` URL where the browser would follow or load it. */
const SCRIPT_URL = new RegExp(
	[
		// [text](url), ![alt](url) and [ref]: url
		String.raw`\]\(\s*<?\s*`,
		String.raw`\]:\s*<?\s*`,
		// <a href="url">, <img src=url> and friends
		String.raw`(?:href|src|srcset|action|formaction|poster|background)\s*=\s*["']?\s*`,
		// <url> autolinks
		String.raw`<\s*`,
	]
		.map((context) => `${context}(?:javascript|vbscript|data)\\s*:`)
		.join("|"),
	"i",
);

/** What the browser and mdsvex end up reading: ASCII percent-escapes decoded, tabs and line breaks dropped. */
const decoded = (body: string) =>
	body
		.replace(/%([0-9a-f]{2})/gi, (sequence, hex: string) => {
			const code = Number.parseInt(hex, 16);
			return code < 0x80 ? String.fromCharCode(code) : sequence;
		})
		.replace(/[\t\n\r]/g, "");

/**
 * Posts are compiled to Svelte components at build time, so a body that is not plain Markdown
 * can break the deploy or run code, in the build and in the visitor's browser.
 * This is the gate for everything saved through the dashboard.
 * Returns the problems found, in Portuguese because they are shown to the editor.
 *
 * ponytail: it checks patterns, it does not compile. Markup that is merely malformed (an unclosed tag)
 * still passes and fails the build; compiling the body with mdsvex here would close that gap.
 */
export function validateBody(body: string): string[] {
	const problems: string[] = [];
	// Fenced and inline code is still parsed by Svelte for braces, so nothing is exempt.
	if (/[{}]/.test(body)) problems.push("O texto não pode conter chaves { }.");

	// mdsvex decodes character references and percent-escapes before Svelte reads the markup,
	// so an encoded brace is as live as a literal one.
	if (ENCODED_BRACE.test(body))
		problems.push("O texto não pode conter chaves codificadas (&#123;, %7B...).");
	const entities = [...body.matchAll(/&(#[0-9a-z]+|[a-z][a-z0-9]*;)/gi)].map((match) => match[1] as string);
	if (
		entities.some((entity) => entity.startsWith("#") || !ALLOWED_ENTITIES.includes(entity.slice(0, -1)))
	) {
		problems.push(
			`Use só estas entidades HTML: ${ALLOWED_ENTITIES.map((name) => `&${name};`).join(" ")}. Escreva os outros caracteres direto no texto.`,
		);
	}

	if (FORBIDDEN_TAG.test(body)) {
		problems.push(`O texto não pode conter as tags ${FORBIDDEN_TAGS.join(", ")}.`);
	}
	if (/<\s*\/?\s*svelte:/i.test(body)) problems.push("O texto não pode conter tags svelte:.");
	if (/<[^>]*[\s"'/]on[a-z]+\s*=/i.test(body)) {
		problems.push("O texto não pode conter atributos de evento (onclick, onerror...).");
	}
	if (/<[^>]*[\s"'/]style\s*=/i.test(body)) problems.push("O texto não pode conter o atributo style.");
	if (SCRIPT_URL.test(decoded(body))) {
		problems.push("Links e imagens não podem usar endereços javascript:, vbscript: ou data:.");
	}

	const allowed = Object.keys(CONTENT_COMPONENTS);
	for (const match of body.matchAll(/<\s*\/?\s*([A-Z][A-Za-z0-9]*)/g)) {
		const name = match[1] as string;
		if (!allowed.includes(name))
			problems.push(`Componente desconhecido: <${name}>. Disponíveis: ${allowed.join(", ")}.`);
	}

	return [...new Set(problems)];
}
