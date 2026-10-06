import type { PreprocessorGroup } from "svelte/compiler";

/** Components a post may use without importing them. Add new ones here and in the admin preview. */
export const CONTENT_COMPONENTS = {
	CardsTable: "#lib/components/CardsTable.svelte",
} as const;

const FRONTMATTER = /^---\n[\s\S]*?\n---\n/;

/** Adds the `<script>` with component imports that MDX-style posts leave implicit. */
export function withComponentImports(markdown: string): string {
	const source = markdown.replace(/\r\n/g, "\n");
	const imports = Object.entries(CONTENT_COMPONENTS)
		.filter(([name]) => new RegExp(`<${name}[\\s/>]`).test(source))
		.map(([name, path]) => `import ${name} from "${path}";`);
	if (imports.length === 0) return source;

	const script = `\n<script>\n${imports.join("\n")}\n</script>\n`;
	const frontmatter = source.match(FRONTMATTER)?.[0] ?? "";
	return frontmatter + script + source.slice(frontmatter.length);
}

export function injectContentComponents(): PreprocessorGroup {
	return {
		name: "inject-content-components",
		markup({ content, filename }) {
			if (!filename?.endsWith(".mdx")) return;
			return { code: withComponentImports(content) };
		},
	};
}
