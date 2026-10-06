import { describe, expect, it } from "vitest";
import { postInputSchema, productSchema } from "./schema.ts";
import { validateBody } from "./validate-body.ts";

describe("validateBody", () => {
	it("accepts plain Markdown with the registered components", () => {
		const body = [
			"## Título",
			"",
			"Texto com **negrito**, [link](https://example.com/a?b=1&c=2) e ![foto](/images/posts/a.webp).",
			"",
			'<CardsTable list="cafeteiras" />',
			"",
			"Preço: R$ 100 &amp; frete. Contato: mailto não é link aqui.",
		].join("\n");

		expect(validateBody(body)).toEqual([]);
	});

	// mdsvex decodes entities and percent-encoding before Svelte sees the markup,
	// so an encoded brace becomes a live Svelte expression that runs during the build.
	it.each([
		"&#123;process.env.SECRET&#125;",
		"&#x7b;1&#x7D;",
		"&#0123;1&#0125;",
		"&#123 1 &#125",
		"&lbrace;1&rbrace;",
		"&lcub;1&rcub;",
		"[x](%7B1%7D)",
		"[x](%7b1%7d)",
		"![&#123;1&#125;](y)",
		"&#X7B;@html 'x'&#X7D;",
	])("refuses encoded braces: %s", (body) => {
		expect(validateBody(body)).toContain("O texto não pode conter chaves codificadas (&#123;, %7B...).");
	});

	it.each([
		"[clique](javascript:alert(1))",
		"[clique](JavaScript:alert(1))",
		"[clique](java\tscript:alert(1))",
		'<a href="javascript:alert(1)">x</a>',
		'<a href=" vbscript:x">x</a>',
		"[x](data:text/html,<b>x</b>)",
	])("refuses script and data URLs: %s", (body) => {
		expect(validateBody(body).join(" ")).toContain("javascript:");
	});

	it.each([
		'<base href="https://evil.example/">',
		'<meta http-equiv="refresh" content="0;url=https://evil.example/">',
		'<link rel="stylesheet" href="https://evil.example/x.css">',
		'<form action="https://evil.example/"><input name="a"><button>ok</button></form>',
		"<svg><a>x</a></svg>",
		"<math></math>",
		"<script>alert(1)</script>",
		"<STYLE>p{}</STYLE>",
		'<iframe src="https://evil.example/"></iframe>',
	])("refuses tags that load, submit or redirect: %s", (body) => {
		expect(validateBody(body).join(" ")).toContain("não pode conter as tags");
	});

	it("refuses inline styles, which can cover the page with a link", () => {
		expect(
			validateBody('<a href="https://example.com" style="position:fixed;inset:0">x</a>').join(" "),
		).toContain("atributo style");
	});

	it("still refuses braces, svelte tags, event attributes and unknown components", () => {
		expect(validateBody("a {b} c")).toHaveLength(1);
		expect(validateBody("<svelte:head></svelte:head>")).toHaveLength(1);
		expect(validateBody('<img src="x" onerror="alert(1)">')).toHaveLength(1);
		expect(validateBody('<img src="x"onerror="alert(1)">')).toHaveLength(1);
		expect(validateBody("<Outro />")[0]).toContain("Componente desconhecido");
	});
});

describe("URLs in the content schemas", () => {
	const post = { title: "T", date: "2026-01-10", category: "cozinha", body: "x" };
	const product = { id: "p", name: "P", image: "/images/posts/p.webp" };
	const cover = (value: string) => postInputSchema.safeParse({ ...post, cover: value }).success;
	const image = (value: string) => productSchema.safeParse({ ...product, image: value }).success;
	const link = (value: unknown) => productSchema.safeParse({ ...product, amazonUrl: value }).success;

	it("accepts local images, https URLs and the placeholders in use", () => {
		expect(cover("")).toBe(true);
		expect(cover("/images/covers/capa.webp")).toBe(true);
		expect(cover("https://cdn.example.com/capa.webp")).toBe(true);
		expect(image("/images/posts/Foto_1.JPG")).toBe(true);
		expect(image("https://http2.mlstatic.com/a.jpg")).toBe(true);
		expect(image("#")).toBe(true);
		expect([null, undefined, "", "#", "https://meli.la/x"].map(link)).toEqual([
			true,
			true,
			true,
			true,
			true,
		]);
	});

	it("refuses script URLs and paths that leave the images folder", () => {
		expect(cover("javascript:alert(1)")).toBe(false);
		expect(cover("/../../../../user/emails")).toBe(false);
		expect(cover("/images/covers/../../../secret.txt")).toBe(false);
		expect(cover("http://example.com/capa.webp")).toBe(false);
		expect(image("/etc/passwd")).toBe(false);
		expect(image("data:image/svg+xml,<svg onload=alert(1)>")).toBe(false);
		expect(link("javascript:alert(document.domain)")).toBe(false);
		expect(link("http://example.com")).toBe(false);
		expect(link("//evil.example")).toBe(false);
	});
});
