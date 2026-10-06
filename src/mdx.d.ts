// Ambient declaration (no top-level imports) so every `.mdx` import is typed.
declare module "*.mdx" {
	import type { Component } from "svelte";

	const component: Component;
	export default component;
	export const metadata: Record<string, unknown>;
}
