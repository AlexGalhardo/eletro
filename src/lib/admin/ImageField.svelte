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

	async function upload(event: Event) {
		const input = event.currentTarget as HTMLInputElement;
		const file = input.files?.[0];
		if (!file) return;

		uploading = true;
		error = "";
		try {
			value = await uploadImage(file, folder);
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
	{#if error}<p role="alert" class="mt-1 text-sm text-red-600 dark:text-red-400">{error}</p>{/if}
</div>
