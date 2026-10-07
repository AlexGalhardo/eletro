<script lang="ts">
	import { ArrowDown, ArrowUp, Plus, Trash2 } from "@lucide/svelte";
	import { untrack } from "svelte";
	import type { Product } from "#lib/content/schema.ts";
	import { goto, invalidateAll } from "$app/navigation";
	import { api, messagesOf, slugify, ui } from "./api.ts";
	import DeployStatus from "./DeployStatus.svelte";
	import ImageField from "./ImageField.svelte";
	import Messages from "./Messages.svelte";

	type Props = {
		/** Present when editing; a new list has neither. */
		name?: string;
		sha?: string;
		products: Product[];
		images: string[];
		deployed?: boolean;
		kind: "github" | "local";
	};
	let { name, sha, products, images, deployed = false, kind }: Props = $props();

	// Taken once: reloading the page data (deploy polling) must not undo what is being typed.
	const initial = untrack(() => ({ isNew: !name, products: $state.snapshot(products), sha }));
	const isNew = initial.isNew;
	const blank = (): Product => ({
		id: "",
		name: "",
		image: "",
		mercadolivreUrl: "",
		shopeeUrl: "",
		amazonUrl: "",
		advantages: [],
		technicalDetails: [],
	});

	// Keys the form does not know about stay in each product and are saved back untouched.
	let items = $state(initial.products.length > 0 ? initial.products : [blank()]);
	let newName = $state("");
	let version = $state(initial.sha);
	let saving = $state(false);
	let errors = $state<string[]>([]);
	let success = $state("");

	const stores = [
		["mercadolivreUrl", "Link Mercado Livre"],
		["shopeeUrl", "Link Shopee"],
		["amazonUrl", "Link Amazon"],
	] as const;

	function move(index: number, by: number) {
		const [item] = items.splice(index, 1);
		if (item) items.splice(index + by, 0, item);
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		errors = [];
		success = "";
		// An id left empty takes the one suggested in the field.
		for (const item of items) item.id ||= slugify(item.name);
		try {
			if (isNew) {
				await api("POST", "/products", { name: newName, products: items });
				await goto(`/admin/products/${newName}`);
				return;
			}
			const saved = await api<{ sha: string }>("PUT", `/products/${name}`, { sha: version, products: items });
			version = saved.sha;
			success = "Lista salva.";
			await invalidateAll();
		} catch (cause) {
			errors = messagesOf(cause);
		} finally {
			saving = false;
		}
	}

	async function remove() {
		const count = items.length === 1 ? "1 produto" : `${items.length} produtos`;
		if (!confirm(`Excluir a lista "${name}" com ${count}? Esta ação não pode ser desfeita pelo painel.`))
			return;
		saving = true;
		errors = [];
		success = "";
		try {
			await api("DELETE", `/products/${name}?sha=${version}`);
			await goto("/admin/products");
		} catch (cause) {
			errors = messagesOf(cause);
			saving = false;
		}
	}
</script>

<form onsubmit={save} class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">{isNew ? "Nova lista de produtos" : `Lista: ${name}`}</h1>
		<div class="flex flex-wrap gap-2">
			{#if !isNew}
				<button type="button" onclick={remove} disabled={saving} class={ui.danger}>
					<Trash2 size={14} aria-hidden="true" /> Excluir lista
				</button>
			{/if}
			<button type="submit" disabled={saving} class={ui.primary}>{saving ? "Salvando..." : "Salvar"}</button>
		</div>
	</div>

	{#if !isNew}<DeployStatus {deployed} {kind} />{/if}
	<Messages {errors} {success} />

	{#if isNew}
		<div class={ui.card}>
			<label for="list-name" class={ui.label}>Nome da lista</label>
			<input
				id="list-name"
				bind:value={newName}
				required
				pattern="[a-z0-9]+(-[a-z0-9]+)*"
				minlength="3"
				placeholder="cafeteiras-expresso"
				class={ui.input}
			/>
			<p class="mt-1 text-xs text-gray-500">
				É o nome usado no post, em &lt;CardsTable list="..." /&gt;. Minúsculas, números e hífens.
			</p>
		</div>
	{:else}
		<p class="text-sm text-gray-600 dark:text-gray-400">
			No post: <code class="font-mono">&lt;CardsTable list="{name}" /&gt;</code>
		</p>
	{/if}

	{#each items as product, index (product)}
		{@const n = index + 1}
		<fieldset class="{ui.card} space-y-4">
			<legend class="px-1 text-sm font-semibold">Produto {n}{product.name ? `: ${product.name}` : ""}</legend>

			<div class="flex flex-wrap justify-end gap-2">
				<button
					type="button"
					aria-label="Subir produto {n}"
					disabled={index === 0}
					onclick={() => move(index, -1)}
					class={ui.button}
				>
					<ArrowUp size={14} aria-hidden="true" />
				</button>
				<button
					type="button"
					aria-label="Descer produto {n}"
					disabled={index === items.length - 1}
					onclick={() => move(index, 1)}
					class={ui.button}
				>
					<ArrowDown size={14} aria-hidden="true" />
				</button>
				<button
					type="button"
					aria-label="Remover produto {n}"
					disabled={items.length === 1}
					onclick={() => items.splice(index, 1)}
					class={ui.danger}
				>
					<Trash2 size={14} aria-hidden="true" />
				</button>
			</div>

			<div class="grid gap-4 md:grid-cols-2">
				<div>
					<label for="name-{n}" class={ui.label}>Nome do produto {n}</label>
					<input
						id="name-{n}"
						bind:value={product.name}
						required
						class={ui.input}
					/>
				</div>
				<div>
					<label for="id-{n}" class={ui.label}>Id do produto {n}</label>
					<input
						id="id-{n}"
						bind:value={product.id}
						placeholder={slugify(product.name) || "gerado a partir do nome"}
						class={ui.input}
					/>
				</div>

				<div class="md:col-span-2">
					<ImageField
						id="image-{n}"
						label="Imagem do produto {n}"
						folder="posts"
						options={images}
						bind:value={product.image}
					/>
				</div>

				{#each stores as [key, label] (key)}
					<div class="md:col-span-2">
						<label for="{key}-{n}" class={ui.label}>{label} do produto {n}</label>
						<input
							id="{key}-{n}"
							type="url"
							value={product[key] ?? ""}
							oninput={(event) => (product[key] = event.currentTarget.value)}
							placeholder="https://"
							class={ui.input}
						/>
					</div>
				{/each}

				<div class="md:col-span-2">
					<label for="advantages-{n}" class={ui.label}>Vantagens do produto {n} (uma por linha)</label>
					<textarea
						id="advantages-{n}"
						rows="4"
						value={product.advantages.join("\n")}
						onchange={(event) =>
							(product.advantages = event.currentTarget.value
								.split("\n")
								.map((line) => line.trim())
								.filter(Boolean))}
						class={ui.input}
					></textarea>
				</div>
			</div>

			<div class="space-y-2">
				<p class={ui.label}>Ficha técnica</p>
				{#each product.technicalDetails as detail, row (row)}
					<div class="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
						<input
							aria-label="Característica {row + 1} do produto {n}"
							placeholder="Característica"
							bind:value={detail.label}
							required
							class={ui.input}
						/>
						<input
							aria-label="Valor {row + 1} do produto {n}"
							placeholder="Valor"
							bind:value={detail.value}
							class={ui.input}
						/>
						<button
							type="button"
							aria-label="Remover característica {row + 1} do produto {n}"
							onclick={() => product.technicalDetails.splice(row, 1)}
							class="{ui.button} mt-1"
						>
							<Trash2 size={14} aria-hidden="true" />
						</button>
					</div>
				{/each}
				<button
					type="button"
					onclick={() => product.technicalDetails.push({ label: "", value: "" })}
					class={ui.button}
				>
					<Plus size={14} aria-hidden="true" /> Adicionar característica
				</button>
			</div>
		</fieldset>
	{/each}

	<div class="flex flex-wrap justify-between gap-3">
		<button type="button" onclick={() => items.push(blank())} class={ui.button}>
			<Plus size={14} aria-hidden="true" /> Adicionar produto
		</button>
		<button type="submit" disabled={saving} class={ui.primary}>{saving ? "Salvando..." : "Salvar"}</button>
	</div>
</form>
