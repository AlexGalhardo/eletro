declare global {
	namespace App {
		// interface Error {}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

declare module "*.mdx" {
	import type { Component } from "svelte";

	const component: Component;
	export default component;
	export const metadata: Record<string, unknown>;
}

export {};
