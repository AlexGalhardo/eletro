import { CONTENT_COMPONENTS } from "./mdx-preprocess.ts";

/**
 * Posts are compiled to Svelte components at build time, so a body that is not plain Markdown
 * can break the deploy or run code. This rejects exactly what mdsvex would treat as code.
 * Returns the problems found, in Portuguese because they are shown to the editor.
 */
export function validateBody(body: string): string[] {
	const problems: string[] = [];
	// Fenced and inline code is still parsed by Svelte for braces, so nothing is exempt.
	if (/[{}]/.test(body)) problems.push("O texto não pode conter chaves { }.");
	if (/<\s*\/?\s*(script|style|iframe|object|embed)\b/i.test(body)) {
		problems.push("O texto não pode conter as tags script, style, iframe, object ou embed.");
	}
	if (/<\s*\/?\s*svelte:/i.test(body)) problems.push("O texto não pode conter tags svelte:.");
	if (/<[^>]*\son[a-z]+\s*=/i.test(body)) {
		problems.push("O texto não pode conter atributos de evento (onclick, onerror...).");
	}

	const allowed = Object.keys(CONTENT_COMPONENTS);
	for (const match of body.matchAll(/<\s*\/?\s*([A-Z][A-Za-z0-9]*)/g)) {
		const name = match[1] as string;
		if (!allowed.includes(name))
			problems.push(`Componente desconhecido: <${name}>. Disponíveis: ${allowed.join(", ")}.`);
	}

	return [...new Set(problems)];
}
