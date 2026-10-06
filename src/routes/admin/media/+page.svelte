<script lang="ts">
	import { messagesOf, ui, uploadImage } from "#lib/admin/api.ts";
	import Messages from "#lib/admin/Messages.svelte";
	import { invalidateAll } from "$app/navigation";

	let { data } = $props();

	const LABELS: Record<string, string> = { covers: "Capas", posts: "Produtos" };

	let uploading = $state(false);
	let errors = $state<string[]>([]);
	let success = $state("");

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const files = [...(input.files ?? [])];
		if (files.length === 0) return;

		uploading = true;
		errors = [];
		success = "";
		try {
			const urls: string[] = [];
			for (const file of files) urls.push(await uploadImage(file, data.folder));
			success = `Enviado: ${urls.join(", ")}`;
			await invalidateAll();
		} catch (cause) {
			errors = messagesOf(cause);
		} finally {
			uploading = false;
			input.value = "";
		}
	}
</script>

<svelte:head>
	<title>Mídia - Painel</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">Mídia</h1>
	<label class="{ui.primary} cursor-pointer">
		{uploading ? "Enviando..." : "Enviar imagens"}
		<input
			type="file"
			multiple
			accept="image/webp,image/jpeg,image/png"
			class="sr-only"
			disabled={uploading}
			onchange={upload}
		/>
	</label>
</div>

<nav aria-label="Pastas" class="mt-6 flex gap-2">
	{#each data.folders as folder (folder)}
		<a
			href="/admin/media?folder={folder}"
			aria-current={folder === data.folder ? "page" : undefined}
			class="{ui.button} aria-[current=page]:bg-gray-200 dark:aria-[current=page]:bg-zinc-800"
		>
			{LABELS[folder] ?? folder}
		</a>
	{/each}
</nav>

<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
	WebP, JPEG ou PNG, até 4 MB. Capas em WebP 16:9. Uma imagem recém-enviada só carrega aqui depois do deploy.
</p>

<div class="mt-4"><Messages {errors} {success} /></div>

<ul class="mt-4 grid grid-cols-2 gap-4 md:grid-cols-4">
	{#each data.images as url (url)}
		<li class="{ui.card} p-2">
			<img
				src={url}
				alt=""
				loading="lazy"
				class="aspect-video w-full rounded bg-gray-100 object-contain dark:bg-zinc-900"
			/>
			<p class="mt-2 font-mono text-xs break-all">{url}</p>
			<button type="button" onclick={() => navigator.clipboard.writeText(url)} class="{ui.button} mt-2 w-full">
				Copiar endereço
			</button>
		</li>
	{:else}
		<li class="col-span-full py-6 text-center text-sm text-gray-500">Nenhuma imagem nesta pasta.</li>
	{/each}
</ul>
