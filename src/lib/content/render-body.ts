import { Marked } from "marked";

const marked = new Marked({ gfm: true });
const CARDS = /<CardsTable\s+list="([^"]+)"\s*\/>/g;

export type BodySegment = { kind: "html"; html: string } | { kind: "cards"; list: string };

function toHtml(markdown: string): string {
	const html = marked.parse(markdown, { async: false });
	return typeof html === "string" ? html : "";
}

/**
 * Splits a post body into HTML and `<CardsTable>` islands. The tag is the only component posts may use;
 * everything else is Markdown. Props stay JSON so the post page can hydrate on the static host.
 */
export function renderPostBody(markdown: string): BodySegment[] {
	const segments: BodySegment[] = [];
	let last = 0;

	for (const match of markdown.matchAll(CARDS)) {
		const before = markdown.slice(last, match.index);
		if (before.trim()) segments.push({ kind: "html", html: toHtml(before) });
		const list = match[1];
		if (list) segments.push({ kind: "cards", list });
		last = (match.index ?? 0) + match[0].length;
	}

	const after = markdown.slice(last);
	if (after.trim()) segments.push({ kind: "html", html: toHtml(after) });
	return segments;
}
