<script lang="ts">
	import { ui } from "#lib/admin/api.ts";

	let { data } = $props();

	let search = $state("");
	let usage = $state("");
	const visible = $derived(
		data.lists.filter(
			(list) =>
				list.name.includes(search.trim().toLowerCase()) &&
				(!usage || (usage === "used") === list.usedBy.length > 0),
		),
	);
</script>

<svelte:head>
	<title>Produtos - Painel</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">Listas de produtos</h1>
	<a href="/admin/products/new" class={ui.primary}>Nova lista</a>
</div>

<div class="mt-6 grid gap-3 md:grid-cols-[2fr_1fr]">
	<div>
		<label for="search" class={ui.label}>Buscar</label>
		<input id="search" type="search" bind:value={search} placeholder="Nome da lista" class={ui.input} />
	</div>
	<div>
		<label for="usage" class={ui.label}>Uso</label>
		<select id="usage" bind:value={usage} class={ui.input}>
			<option value="">Todas</option>
			<option value="used">Em uso</option>
			<option value="unused">Sem uso</option>
		</select>
	</div>
</div>

<p class="mt-4 text-sm text-gray-600 dark:text-gray-400" aria-live="polite">{visible.length} lista(s)</p>

<ul class="{ui.card} mt-2 divide-y divide-gray-200 dark:divide-zinc-800">
	{#each visible as list (list.name)}
		<li class="flex flex-wrap justify-between gap-x-4 py-2 text-sm">
			<span>
				<a href="/admin/products/{list.name}" class="font-medium hover:underline">{list.name}</a>
				{#if !list.deployed}<span class="text-amber-600 dark:text-amber-400"> · aguardando deploy</span>{/if}
			</span>
			<span class="text-gray-600 dark:text-gray-400">
				{#each list.usedBy as slug, index (slug)}
					{index > 0 ? ", " : "Usada em: "}<a href="/admin/posts/{slug}" class="hover:underline">{slug}</a>
				{:else}
					Sem uso
				{/each}
			</span>
		</li>
	{:else}
		<li class="py-4 text-center text-sm text-gray-500">Nenhuma lista encontrada.</li>
	{/each}
</ul>
