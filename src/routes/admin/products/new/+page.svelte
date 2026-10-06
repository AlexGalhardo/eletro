<script lang="ts">
	import ProductListEditor from "#lib/admin/ProductListEditor.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>Nova lista - Painel</title>
</svelte:head>

<ProductListEditor products={[]} images={data.images} kind={data.kind} />
