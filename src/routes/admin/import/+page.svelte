<script lang="ts">
	import { api, messagesOf, ui } from "#lib/admin/api.ts";
	import Messages from "#lib/admin/Messages.svelte";
	import { site } from "#lib/site.config.ts";

	type Imported = { slug: string; list: string; products: number; source: string };

	let url = $state("");
	let importing = $state(false);
	let errors = $state<string[]>([]);
	let imported = $state<Imported | null>(null);

	async function start(event: SubmitEvent) {
		event.preventDefault();
		importing = true;
		errors = [];
		imported = null;
		try {
			imported = await api<Imported>("POST", "/imports", { url });
			url = "";
		} catch (cause) {
			errors = messagesOf(cause);
		} finally {
			importing = false;
		}
	}
</script>

<svelte:head>
	<title>Importar - Painel</title>
</svelte:head>

<h1 class="text-2xl font-bold">Importar post</h1>

<p class="mt-2 max-w-3xl text-sm text-gray-600 dark:text-gray-400">
	Cole o endereço de uma review de {site.postImport.sourceHosts[0]}. O painel lê a página, copia os
	{site.postImport.maxProducts} primeiros produtos (nome, foto e ficha técnica) e cria um rascunho. O texto do
	rascunho é genérico, gerado a partir da ficha técnica: reescreva antes de publicar.
</p>

<form onsubmit={start} class="{ui.card} mt-6 max-w-3xl space-y-4">
	<label class={ui.label}>
		Endereço do post de origem
		<input
			type="url"
			required
			bind:value={url}
			disabled={importing}
			placeholder="https://{site.postImport.sourceHosts[0]}/categoria/post/"
			class={ui.input}
		/>
	</label>
	<button type="submit" class={ui.primary} disabled={importing}>
		{importing ? "Importando... (pode levar um minuto)" : "Iniciar importação"}
	</button>
</form>

<div class="mt-4 max-w-3xl"><Messages {errors} /></div>

{#if imported}
	<div class="{ui.card} mt-4 max-w-3xl space-y-3" role="status">
		<p class="font-semibold">Rascunho criado com {imported.products} produtos.</p>
		<ul class="list-disc space-y-1 pl-5 text-sm">
			<li>Troque os links de afiliado, que estão como <code>#</code>.</li>
			<li>Envie a capa do post (o rascunho está sem capa).</li>
			<li>Reescreva o título, a descrição, o texto e as perguntas frequentes.</li>
			<li>Confira se as fotos dos produtos podem ser usadas.</li>
		</ul>
		<div class="flex flex-wrap gap-2">
			<a href="/admin/posts/{imported.slug}" class={ui.primary}>Abrir o rascunho</a>
			<a href="/admin/products/{imported.list}" class={ui.button}>Abrir a lista de produtos</a>
		</div>
	</div>
{/if}
