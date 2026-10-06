import { describe, expect, it } from "vitest";
import { withComponentImports } from "./mdx-preprocess.ts";

describe("withComponentImports", () => {
	it("adds the import after the frontmatter when the component is used", () => {
		const result = withComponentImports(`---\ntitle: T\n---\n\nTexto\n\n<CardsTable list="x" />\n`);

		expect(result.startsWith("---\ntitle: T\n---\n")).toBe(true);
		expect(result).toContain('import CardsTable from "#lib/components/CardsTable.svelte";');
		expect(result.indexOf("<script>")).toBeLessThan(result.indexOf("Texto"));
	});

	it("leaves posts without components untouched", () => {
		const source = "---\ntitle: T\n---\n\nSó texto.\n";

		expect(withComponentImports(source)).toBe(source);
	});

	it("handles Windows line endings and missing frontmatter", () => {
		expect(withComponentImports(`---\r\ntitle: T\r\n---\r\n<CardsTable list="x" />`)).toMatch(
			/^---\ntitle: T\n---\n\n<script>/,
		);
		expect(withComponentImports(`<CardsTable list="x" />`)).toMatch(/^\n<script>/);
	});
});
