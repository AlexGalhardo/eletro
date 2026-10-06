<script lang="ts">
	let { data } = $props();
</script>

<svelte:head>
	<title>Painel</title>
</svelte:head>

<h1 class="text-2xl font-bold">Painel</h1>
<p class="mt-2 text-sm text-gray-600 dark:text-gray-400">Você entrou como {data.admin?.name}.</p>
