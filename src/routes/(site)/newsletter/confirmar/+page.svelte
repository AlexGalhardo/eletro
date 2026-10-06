<script lang="ts">
	import { site } from "#lib/site.config.ts";

	let { data } = $props();
</script>

<svelte:head>
	<title>Inscrição - {site.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-16 text-center text-black dark:text-white">
	{#if data.confirmed}
		<h1 class="mb-4 text-3xl font-bold">Inscrição confirmada</h1>
		<p>Você vai receber um e-mail sempre que sair uma análise nova.</p>
	{:else}
		<h1 class="mb-4 text-3xl font-bold">Link inválido</h1>
		<p>Este link de confirmação não vale mais. Faça a inscrição de novo pelo formulário no rodapé.</p>
	{/if}
	<a href="/" class="mt-6 inline-block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
		Voltar para o início
	</a>
</main>
