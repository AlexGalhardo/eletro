<script lang="ts">
	import ProductListEditor from "#lib/admin/ProductListEditor.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.name} - Painel</title>
</svelte:head>

{#key data.name}
	<ProductListEditor
		name={data.name}
		sha={data.sha}
		products={data.products}
		images={data.images}
		deployed={data.deployed}
		kind={data.kind}
		usedBy={data.usedBy}
	/>
{/key}
