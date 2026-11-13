// Stroke icons previously rendered by @lucide/svelte. Node data is the Lucide 1.52 set (ISC).
import nodes from "./lucide.json";

type IconNode = [string, Record<string, string | number>];

function readIcons(value: unknown): Record<string, IconNode[]> {
	if (typeof value !== "object" || value === null) return {};
	return value as Record<string, IconNode[]>;
}

const icons = readIcons(nodes);

/** Inner SVG markup for a Lucide icon. Unknown names fall back to the tag icon. */
export function lucideInner(name: string): string {
	const icon = icons[name] ?? icons.tag ?? [];
	return icon
		.map(([tag, attrs]) => {
			const serialized = Object.entries(attrs)
				.map(([key, value]) => `${key}="${String(value).replaceAll('"', "&quot;")}"`)
				.join(" ");
			return `<${tag} ${serialized}/>`;
		})
		.join("");
}
