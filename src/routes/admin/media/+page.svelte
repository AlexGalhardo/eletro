<script lang="ts">
	import { onMount } from "svelte";
	import { messagesOf, ui, uploadImage } from "#lib/admin/api.ts";
	import Messages from "#lib/admin/Messages.svelte";
	import { invalidateAll } from "$app/navigation";
	import { page } from "$app/state";

	let { data } = $props();

	const LABELS: Record<string, string> = { covers: "Capas", posts: "Produtos" };

	let uploading = $state(false);
	let errors = $state<string[]>([]);
	let success = $state("");

	let copied = $state("");
	let dialog: HTMLDialogElement;

	// The full address on the server being used (localhost or production), so the link works when pasted anywhere.
	const absolute = (url: string) => new URL(url, page.url.origin).href;

	onMount(() => {
		let clipboard: { destroy(): void } | undefined;
		let gone = false;
		// Loaded in the browser only: the library is written for a page, not for the server render.
		import("clipboard").then(({ default: ClipboardJS }) => {
			if (gone) return;
			// One listener for every button, including those of images uploaded after this ran.
			clipboard = new ClipboardJS("[data-clipboard-text]")
				.on("success", (event) => {
					copied = event.text;
					dialog.showModal();
				})
				.on("error", () => {
					errors = ["O navegador não deixou copiar. Selecione o endereço e copie à mão."];
				});
		});
		return () => {
			gone = true;
			clipboard?.destroy();
		};
	});

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
			<p class="mt-2 font-mono text-xs break-all">{absolute(url)}</p>
			<button type="button" data-clipboard-text={absolute(url)} class="{ui.button} mt-2 w-full">
				Copiar link
			</button>
		</li>
	{:else}
		<li class="col-span-full py-6 text-center text-sm text-gray-500">Nenhuma imagem nesta pasta.</li>
	{/each}
</ul>

<dialog
	bind:this={dialog}
	aria-labelledby="copied-title"
	class="m-auto w-[min(28rem,calc(100%-2rem))] rounded-xl border border-gray-200 bg-white p-6 text-black backdrop:bg-black/50 dark:border-zinc-800 dark:bg-zinc-950 dark:text-white"
>
	<h2 id="copied-title" class="text-lg font-bold">Link copiado</h2>
	<p class="mt-2 font-mono text-xs break-all">{copied}</p>
	<form method="dialog" class="mt-4 text-right">
		<button type="submit" class={ui.primary}>OK</button>
	</form>
</dialog>
