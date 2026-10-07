<script lang="ts">
	import { Upload } from "@lucide/svelte";
	import { messagesOf, ui, uploadImage } from "./api.ts";

	let {
		value = $bindable(""),
		label,
		folder,
		options = [],
		id,
	}: { value?: string; label: string; folder: "covers" | "posts"; options?: string[]; id: string } = $props();

	let uploading = $state(false);
	let error = $state("");

	// A file sent a moment ago is not on the site until the next deploy, so its preview comes from the
	// browser's copy of it.
	let sent = $state<{ url: string; preview: string }>();
	// The address whose image did not load: a typo, or a file that is not deployed yet.
	let broken = $state("");
	const preview = $derived(sent?.url === value ? sent.preview : value);

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;
		error = "";
		try {
			value = await uploadImage(file, folder);
			if (sent) URL.revokeObjectURL(sent.preview);
			sent = { url: value, preview: URL.createObjectURL(file) };
		} catch (cause) {
			error = messagesOf(cause).join(" ");
		} finally {
			uploading = false;
			input.value = "";
		}
	}
</script>

<div>
	<label for={id} class={ui.label}>{label}</label>
	<div class="flex gap-2">
		<input {id} bind:value list="{id}-options" placeholder="/images/{folder}/arquivo.webp" class={ui.input} />
		<label class="{ui.button} mt-1 shrink-0 cursor-pointer">
			<Upload size={14} aria-hidden="true" />
			{uploading ? "Enviando..." : "Enviar"}
			<input
				type="file"
				accept="image/webp,image/jpeg,image/png"
				class="sr-only"
				aria-label="Enviar imagem: {label}"
				disabled={uploading}
				onchange={upload}
			/>
		</label>
	</div>
	<datalist id="{id}-options">
		{#each options as option (option)}
			<option value={option}></option>
		{/each}
	</datalist>
	{#if value && broken !== value}
		<img
			src={preview}
			alt="Pré-visualização: {label}"
			onerror={() => (broken = value)}
			class="mt-2 rounded border border-gray-200 bg-white dark:border-zinc-800 {folder === 'covers'
				? 'aspect-video w-full max-w-sm object-cover'
				: 'h-32 w-32 object-contain'}"
		/>
	{:else if value}
		<p class="mt-1 text-xs text-gray-500">
			A imagem não carregou. Confira o endereço; um arquivo enviado há pouco só aparece depois do deploy.
		</p>
	{/if}
	{#if error}<p role="alert" class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>{/if}
</div>
