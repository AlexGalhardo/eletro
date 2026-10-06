<script lang="ts">
	import Footer from "#lib/components/Footer.svelte";
	import Header from "#lib/components/Header.svelte";

	let { data, children } = $props();
</script>

<Header posts={data.searchIndex} />

{@render children()}

<Footer />
