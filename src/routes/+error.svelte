<script lang="ts">
	import { page } from "$app/state";
</script>

<svelte:head>
	<title>{page.status} - {page.status === 404 ? "Página Não Encontrada" : "Erro"}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<div class="flex min-h-screen items-center justify-center bg-white dark:bg-black">
	<div class="text-center">
		<h1 class="mb-4 text-4xl font-bold text-black dark:text-white">{page.status}</h1>
		<p class="mb-4 text-black dark:text-white">
			{page.status === 404 ? "Página Não Encontrada" : "Algo deu errado. Tente novamente."}
		</p>
		<a href="/" class="text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
			Voltar para o início
		</a>
	</div>
</div>
