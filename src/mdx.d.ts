// Ambient declaration (no top-level imports) so a `.mdx` import stays typed without a framework.
declare module "*.mdx" {
	const component: unknown;
	export default component;
	export const metadata: Record<string, unknown>;
}
