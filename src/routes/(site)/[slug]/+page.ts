import { error } from "@sveltejs/kit";
import type { Component } from "svelte";

// Each post compiles to its own chunk, loaded only when that post is opened.
const modules = import.meta.glob<{ default: Component }>("/content/posts/*.mdx");

export async function load({ params, data }) {
	const loader = modules[`/content/posts/${params.slug}.mdx`];
	if (!loader) error(404, "Postagem não encontrada");

	return { ...data, Content: (await loader()).default };
}
