<script lang="ts">
	import { api, messagesOf, ui } from "#lib/admin/api.ts";
	import Messages from "#lib/admin/Messages.svelte";
	import { site } from "#lib/site.config.ts";
	import { invalidateAll } from "$app/navigation";

	let { data } = $props();

	let busy = $state(false);
	let errors = $state<string[]>([]);
	let success = $state("");

	const number = (value: number) => value.toLocaleString(site.locale);
	const percent = (value: number) =>
		value.toLocaleString(site.locale, { style: "percent", maximumFractionDigits: 1 });
	const position = (value: number) => value.toLocaleString(site.locale, { maximumFractionDigits: 1 });
	const day = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");
	// Search Console reports full URLs; the path is enough inside the site's own panel.
	const path = (url: string) => (URL.canParse(url) ? new URL(url).pathname : url);

	const search = $derived(data.searchConsole?.data);
	const analytics = $derived(data.analytics?.data);

	async function resubmit() {
		busy = true;
		errors = [];
		success = "";
		try {
			const { sitemap } = await api<{ sitemap: string }>("POST", "/google/sitemap");
			success = `${sitemap} enviado. O Google lê o arquivo de novo nos próximos minutos.`;
			await invalidateAll();
		} catch (cause) {
			errors = messagesOf(cause);
		} finally {
			busy = false;
		}
	}

	const th = "px-4 py-2 font-medium";
	const thead = "border-b border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400";
	const muted = "text-sm text-gray-600 dark:text-gray-400";
</script>

<svelte:head>
	<title>Google - Painel</title>
</svelte:head>

<h1 class="text-2xl font-bold">Google</h1>
<p class="mt-1 {muted}">Search Console e Analytics, últimos {data.days} dias.</p>

{#if data.missing.length > 0}
	<p class="{ui.card} mt-4 text-sm">
		Variáveis de ambiente que faltam neste servidor: {data.missing.join(", ")}. O passo a passo está em
		<code>docs/google-console-analytics-setup.md</code>.
	</p>
{/if}

<div class="mt-4"><Messages {errors} {success} /></div>

{#if data.searchConsole}
	<section class="mt-8">
		<h2 class="text-lg font-bold">Search Console</h2>
		{#if data.searchConsole.error}
			<div class="mt-3"><Messages errors={[data.searchConsole.error]} /></div>
		{/if}
		{#if search}
			<dl class="mt-3 grid grid-cols-2 gap-4 md:grid-cols-4">
				<div class={ui.card}>
					<dt class={muted}>Cliques</dt>
					<dd class="mt-1 text-3xl font-bold">{number(search.totals.clicks)}</dd>
				</div>
				<div class={ui.card}>
					<dt class={muted}>Impressões</dt>
					<dd class="mt-1 text-3xl font-bold">{number(search.totals.impressions)}</dd>
				</div>
				<div class={ui.card}>
					<dt class={muted}>CTR</dt>
					<dd class="mt-1 text-3xl font-bold">{percent(search.totals.ctr)}</dd>
				</div>
				<div class={ui.card}>
					<dt class={muted}>Posição média</dt>
					<dd class="mt-1 text-3xl font-bold">{position(search.totals.position)}</dd>
				</div>
			</dl>

			{#each [{ title: "Consultas", rows: search.queries }, { title: "Páginas", rows: search.pages }] as table (table.title)}
				<h3 class="mt-6 font-semibold">{table.title} com mais cliques</h3>
				<div class="{ui.card} mt-3 overflow-x-auto p-0">
					<table class="w-full text-left text-sm">
						<thead class={thead}>
							<tr>
								<th scope="col" class={th}>{table.title}</th>
								<th scope="col" class={th}>Cliques</th>
								<th scope="col" class={th}>Impressões</th>
								<th scope="col" class={th}>CTR</th>
								<th scope="col" class={th}>Posição</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-200 dark:divide-zinc-800">
							{#each table.rows as row (row.key)}
								<tr>
									<td class="px-4 py-2">{path(row.key)}</td>
									<td class="px-4 py-2">{number(row.clicks)}</td>
									<td class="px-4 py-2">{number(row.impressions)}</td>
									<td class="px-4 py-2">{percent(row.ctr)}</td>
									<td class="px-4 py-2">{position(row.position)}</td>
								</tr>
							{:else}
								<tr><td colspan="5" class="px-4 py-6 text-center text-gray-500">Sem dados no período.</td></tr>
							{/each}
						</tbody>
					</table>
				</div>
			{/each}

			<div class="mt-6 flex flex-wrap items-center justify-between gap-3">
				<h3 class="font-semibold">Sitemaps</h3>
				<button type="button" onclick={resubmit} disabled={busy} class={ui.primary}>
					{busy ? "Aguarde..." : "Reenviar sitemap ao Google"}
				</button>
			</div>
			<div class="{ui.card} mt-3 overflow-x-auto p-0">
				<table class="w-full text-left text-sm">
					<thead class={thead}>
						<tr>
							<th scope="col" class={th}>Sitemap</th>
							<th scope="col" class={th}>Enviado</th>
							<th scope="col" class={th}>Lido pelo Google</th>
							<th scope="col" class={th}>URLs</th>
							<th scope="col" class={th}>Erros</th>
							<th scope="col" class={th}>Avisos</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-zinc-800">
						{#each search.sitemaps as sitemap (sitemap.path)}
							<tr>
								<td class="px-4 py-2">{sitemap.path}</td>
								<td class="px-4 py-2 whitespace-nowrap">{day(sitemap.lastSubmitted)}</td>
								<td class="px-4 py-2 whitespace-nowrap">
									{sitemap.pending ? "Na fila" : day(sitemap.lastDownloaded)}
								</td>
								<td class="px-4 py-2">{number(sitemap.submitted)}</td>
								<td class="px-4 py-2">{number(sitemap.errors)}</td>
								<td class="px-4 py-2">{number(sitemap.warnings)}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="6" class="px-4 py-6 text-center text-gray-500">Nenhum sitemap enviado ainda.</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
{/if}

{#if data.analytics}
	<section class="mt-8">
		<h2 class="text-lg font-bold">Analytics</h2>
		{#if data.analytics.error}
			<div class="mt-3"><Messages errors={[data.analytics.error]} /></div>
		{/if}
		{#if analytics}
			<dl class="mt-3 grid grid-cols-3 gap-4">
				<div class={ui.card}>
					<dt class={muted}>Usuários</dt>
					<dd class="mt-1 text-3xl font-bold">{number(analytics.totals.users)}</dd>
				</div>
				<div class={ui.card}>
					<dt class={muted}>Sessões</dt>
					<dd class="mt-1 text-3xl font-bold">{number(analytics.totals.sessions)}</dd>
				</div>
				<div class={ui.card}>
					<dt class={muted}>Visualizações</dt>
					<dd class="mt-1 text-3xl font-bold">{number(analytics.totals.views)}</dd>
				</div>
			</dl>

			<h3 class="mt-6 font-semibold">Páginas mais vistas</h3>
			<div class="{ui.card} mt-3 overflow-x-auto p-0">
				<table class="w-full text-left text-sm">
					<thead class={thead}>
						<tr>
							<th scope="col" class={th}>Página</th>
							<th scope="col" class={th}>Visualizações</th>
							<th scope="col" class={th}>Usuários</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-200 dark:divide-zinc-800">
						{#each analytics.pages as row (row.path)}
							<tr>
								<td class="px-4 py-2">{row.path}</td>
								<td class="px-4 py-2">{number(row.views)}</td>
								<td class="px-4 py-2">{number(row.users)}</td>
							</tr>
						{:else}
							<tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Sem dados no período.</td></tr>
						{/each}
					</tbody>
				</table>
			</div>
		{/if}
	</section>
{/if}
