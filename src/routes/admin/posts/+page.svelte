<script lang="ts">
	import { ui } from "#lib/admin/api.ts";
	import { site } from "#lib/site.config.ts";
	import { page } from "$app/state";

	let { data } = $props();

	const STATUS = {
		published: "Publicado",
		scheduled: "Agendado",
		draft: "Rascunho",
		invalid: "Com erro",
	} as const;

	let search = $state("");
	let status = $state(page.url.searchParams.get("status") ?? "");
	let category = $state("");

	const fold = (text: string) =>
		text
			.normalize("NFD")
			.replace(/[̀-ͯ]/g, "")
			.toLowerCase();

	const visible = $derived(
		data.posts.filter(
			(post) =>
				(!search || fold(`${post.title} ${post.slug}`).includes(fold(search))) &&
				(!category || post.category === category) &&
				(!status || (status === "pending" ? !post.deployed : post.status === status)),
		),
	);

	const day = (date: string) => date.split("-").reverse().join("/");
</script>

<svelte:head>
	<title>Posts - Painel</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">Posts</h1>
	<a href="/admin/posts/new" class={ui.primary}>Novo post</a>
</div>

<div class="mt-6 grid gap-3 md:grid-cols-[2fr_1fr_1fr]">
	<div>
		<label for="search" class={ui.label}>Buscar</label>
		<input id="search" type="search" bind:value={search} placeholder="Título ou slug" class={ui.input} />
	</div>
	<div>
		<label for="status" class={ui.label}>Status</label>
		<select id="status" bind:value={status} class={ui.input}>
			<option value="">Todos</option>
			{#each Object.entries(STATUS) as [value, label] (value)}
				<option {value}>{label}</option>
			{/each}
			<option value="pending">Aguardando deploy</option>
		</select>
	</div>
	<div>
		<label for="category" class={ui.label}>Categoria</label>
		<select id="category" bind:value={category} class={ui.input}>
			<option value="">Todas</option>
			{#each site.categories as item (item.id)}
				<option value={item.id}>{item.label}</option>
			{/each}
		</select>
	</div>
</div>

<p class="mt-4 text-sm text-gray-600 dark:text-gray-400" aria-live="polite">{visible.length} post(s)</p>

<div class="{ui.card} mt-2 overflow-x-auto p-0">
	<table class="w-full text-left text-sm">
		<thead class="border-b border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400">
			<tr>
				<th scope="col" class="px-4 py-2 font-medium">Título</th>
				<th scope="col" class="px-4 py-2 font-medium">Categoria</th>
				<th scope="col" class="px-4 py-2 font-medium">Produtos</th>
				<th scope="col" class="px-4 py-2 font-medium">Data</th>
				<th scope="col" class="px-4 py-2 font-medium">Status</th>
			</tr>
		</thead>
		<tbody class="divide-y divide-gray-200 dark:divide-zinc-800">
			{#each visible as post (post.slug)}
				<tr>
					<td class="px-4 py-2">
						<a href="/admin/posts/{post.slug}" class="font-medium hover:underline">{post.title}</a>
					</td>
					<td class="px-4 py-2">{post.category}</td>
					<td class="px-4 py-2">
						{#each post.lists as list, index (list)}
							{index > 0 ? ", " : ""}<a href="/admin/products/{list}" class="hover:underline">{list}</a>
						{/each}
					</td>
					<td class="px-4 py-2 whitespace-nowrap">{day(post.date)}</td>
					<td class="px-4 py-2 whitespace-nowrap">
						{STATUS[post.status]}{#if !post.deployed}
							<span class="text-amber-600 dark:text-amber-400"> · aguardando deploy</span>
						{/if}
					</td>
				</tr>
			{:else}
				<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Nenhum post encontrado.</td></tr>
			{/each}
		</tbody>
	</table>
</div>
