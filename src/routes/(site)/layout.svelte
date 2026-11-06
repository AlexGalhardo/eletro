<script lang="ts">
	import Footer from "#lib/components/Footer.svelte";
	import Header from "#lib/components/Header.svelte";

	let { data, children }: { data: { searchIndex: { slug: string; title: string }[]; activeCategories: string[] }; children: import("svelte").Snippet } = $props();
</script>

<Header posts={data.searchIndex} />

{@render children()}

<Footer activeCategories={data.activeCategories} />
