<script lang="ts">
	import { ui } from "#lib/admin/api.ts";

	let { data } = $props();

	const cards = $derived([
		{ label: "Posts publicados", value: data.totals.published, href: "/admin/posts?status=published" },
		{ label: "Rascunhos", value: data.totals.drafts, href: "/admin/posts?status=draft" },
		{ label: "Agendados", value: data.totals.scheduled, href: "/admin/posts?status=scheduled" },
		{ label: "Aguardando deploy", value: data.totals.pending, href: "/admin/posts?status=pending" },
		{ label: "Listas de produtos", value: data.totals.lists, href: "/admin/products" },
		{ label: "Assinantes confirmados", value: data.totals.subscribers, href: "" },
	]);

	const day = (iso: string) => iso.slice(0, 10).split("-").reverse().join("/");
</script>

<svelte:head>
	<title>Painel</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">Painel</h1>
	<a href="/admin/posts/new" class={ui.primary}>Novo post</a>
</div>

{#if data.totals.invalid > 0}
	<p role="alert" class="mt-4 text-sm text-red-600 dark:text-red-400">
		{data.totals.invalid} post(s) com erro no arquivo.
		<a href="/admin/posts?status=invalid" class="underline">Ver</a>
	</p>
{/if}

<dl class="mt-6 grid grid-cols-2 gap-4 md:grid-cols-3">
	{#each cards as card (card.label)}
		<div class={ui.card}>
			<dt class="text-sm text-gray-600 dark:text-gray-400">
				{#if card.href}<a href={card.href} class="hover:underline">{card.label}</a>{:else}{card.label}{/if}
			</dt>
			<dd class="mt-1 text-3xl font-bold">{card.value}</dd>
		</div>
	{/each}
</dl>

<section class="mt-8">
	<h2 class="text-lg font-bold">Links de afiliado</h2>
	<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
		Todos os links dos posts publicados, no formato que o dashboard de links importa.
	</p>
	<div class="mt-3 flex flex-wrap gap-2">
		<a href="/api/v1/affiliate-links?format=json" download class={ui.button}>Exportar links (JSON)</a>
		<a href="/api/v1/affiliate-links?format=csv" download class={ui.button}>Exportar links (CSV)</a>
	</div>
</section>

<section class="mt-8">
	<h2 class="text-lg font-bold">Últimas alterações de conteúdo</h2>
	{#if data.commits.length > 0}
		<ul class="{ui.card} mt-3 divide-y divide-gray-200 dark:divide-zinc-800">
			{#each data.commits as commit (commit.sha)}
				<li class="flex flex-wrap justify-between gap-x-4 py-2 text-sm">
					<a href={commit.url} target="_blank" rel="noopener" class="hover:underline">{commit.message}</a>
					<span class="text-gray-600 dark:text-gray-400">{commit.author}, {day(commit.date)}</span>
				</li>
			{/each}
		</ul>
	{:else}
		<p class="mt-3 text-sm text-gray-600 dark:text-gray-400">
			{data.kind === "github"
				? "Nenhuma alteração encontrada."
				: "O conteúdo está sendo gravado no disco local. O histórico aparece quando o painel grava pelo GitHub."}
		</p>
	{/if}
</section>
