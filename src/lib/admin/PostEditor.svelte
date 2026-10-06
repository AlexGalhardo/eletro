<script lang="ts">
	import { Plus, Trash2 } from "@lucide/svelte";
	import { marked } from "marked";
	import { untrack } from "svelte";
	import type { PostInput } from "#lib/content/schema.ts";
	import { site } from "#lib/site.config.ts";
	import { goto, invalidateAll } from "$app/navigation";
	import { api, messagesOf, slugify, ui } from "./api.ts";
	import DeployStatus from "./DeployStatus.svelte";
	import ImageField from "./ImageField.svelte";
	import Messages from "./Messages.svelte";

	type Props = {
		/** Present when editing; a new post has neither. */
		slug?: string;
		sha?: string;
		post: PostInput;
		lists: string[];
		covers: string[];
		deployed?: boolean;
		kind: "github" | "local";
	};
	let { slug, sha, post, lists, covers, deployed = false, kind }: Props = $props();

	// The form owns a copy taken once: reloading the page data (deploy polling) must not undo what is being typed.
	const initial = untrack(() => ({ isNew: !slug, post: $state.snapshot(post), sha }));
	const isNew = initial.isNew;
	let form = $state(initial.post);
	let newSlug = $state("");
	let slugTouched = $state(false);
	let version = $state(initial.sha);
	let list = $state("");
	let announce = $state(false);
	let saving = $state(false);
	let errors = $state<string[]>([]);
	let success = $state("");
	let textarea: HTMLTextAreaElement;

	const authors = Object.entries(site.authors);
	const suggestedSlug = $derived(slugTouched ? newSlug : slugify(form.title));

	// Scripts never run inside the sandboxed frame, whatever the Markdown contains.
	const preview = $derived(
		`<style>body{font:16px/1.6 system-ui,sans-serif;margin:16px;color:#111}img{max-width:100%}.cards{border:1px dashed #888;border-radius:8px;padding:12px;color:#555}</style>${marked.parse(
			form.body.replace(
				/<CardsTable\s+list="([^"]*)"\s*\/>/g,
				'<div class="cards">Lista de produtos: <b>$1</b></div>',
			),
			{ async: false },
		)}`,
	);

	function insertList() {
		if (!list) return;
		const tag = `<CardsTable list="${list}" />`;
		const at = textarea.selectionStart ?? form.body.length;
		form.body = `${form.body.slice(0, at)}\n\n${tag}\n\n${form.body.slice(at)}`.trim();
		list = "";
	}

	/** Queues the e-mail to subscribers. It only goes out once the post is live, and never twice. */
	async function queueAnnouncement(target: string): Promise<boolean> {
		if (!announce || form.draft) return false;
		await api("POST", "/newsletter/dispatches", { slug: target });
		announce = false;
		return true;
	}

	async function save(event: SubmitEvent) {
		event.preventDefault();
		saving = true;
		errors = [];
		success = "";
		try {
			if (isNew) {
				await api("POST", "/posts", { slug: suggestedSlug, ...form });
				await queueAnnouncement(suggestedSlug);
				await goto(`/admin/posts/${suggestedSlug}`);
				return;
			}
			const saved = await api<{ sha: string }>("PUT", `/posts/${slug}`, { sha: version, ...form });
			version = saved.sha;
			success = (await queueAnnouncement(slug as string))
				? "Post salvo. Os assinantes serão avisados quando ele estiver no ar."
				: "Post salvo.";
			await invalidateAll();
		} catch (cause) {
			errors = messagesOf(cause);
		} finally {
			saving = false;
		}
	}

	async function remove() {
		if (!confirm(`Excluir o post "${form.title}"? Esta ação não pode ser desfeita pelo painel.`)) return;
		saving = true;
		errors = [];
		try {
			await api("DELETE", `/posts/${slug}?sha=${version}`);
			await goto("/admin/posts");
		} catch (cause) {
			errors = messagesOf(cause);
			saving = false;
		}
	}
</script>

<form onsubmit={save} class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<h1 class="text-2xl font-bold">{isNew ? "Novo post" : "Editar post"}</h1>
		<div class="flex flex-wrap gap-2">
			{#if !isNew}
				<a href="/{slug}" target="_blank" rel="noopener" class={ui.button}>Ver no site</a>
				<button type="button" onclick={remove} disabled={saving} class={ui.danger}>
					<Trash2 size={14} aria-hidden="true" /> Excluir
				</button>
			{/if}
			<button type="submit" disabled={saving} class={ui.primary}>
				{saving ? "Salvando..." : "Salvar"}
			</button>
		</div>
	</div>

	{#if !isNew}<DeployStatus {deployed} {kind} />{/if}
	<Messages {errors} {success} />

	<div class="{ui.card} grid gap-4 md:grid-cols-2">
		<div class="md:col-span-2">
			<label for="title" class={ui.label}>Título</label>
			<input id="title" bind:value={form.title} required class={ui.input} />
		</div>

		<div class="md:col-span-2">
			<label for="slug" class={ui.label}>Endereço (slug)</label>
			{#if isNew}
				<input
					id="slug"
					value={suggestedSlug}
					oninput={(event) => {
						slugTouched = true;
						newSlug = event.currentTarget.value;
					}}
					required
					pattern="[a-z0-9]+(-[a-z0-9]+)*"
					minlength="3"
					class={ui.input}
				/>
				<p class="mt-1 text-xs text-gray-500">
					Vira a URL do post e não pode ser trocado depois. Minúsculas, números e hífens.
				</p>
			{:else}
				<input id="slug" value={slug} disabled class={ui.input} />
			{/if}
		</div>

		<div class="md:col-span-2">
			<label for="description" class={ui.label}>Descrição</label>
			<textarea id="description" bind:value={form.description} rows="2" class={ui.input}></textarea>
		</div>

		<div>
			<label for="date" class={ui.label}>Data de publicação</label>
			<input id="date" type="date" bind:value={form.date} required class={ui.input} />
			<p class="mt-1 text-xs text-gray-500">Uma data futura agenda o post.</p>
		</div>

		<div>
			<label for="category" class={ui.label}>Categoria</label>
			<select id="category" bind:value={form.category} required class={ui.input}>
				{#each site.categories as category (category.id)}
					<option value={category.id}>{category.label}</option>
				{/each}
			</select>
		</div>

		<div>
			<label for="author" class={ui.label}>Autor</label>
			<select id="author" bind:value={form.author} class={ui.input}>
				{#each authors as [id, author] (id)}
					<option value={id}>{author.name}</option>
				{/each}
			</select>
		</div>

		<label class="flex items-center gap-2 self-end pb-2 text-sm font-semibold">
			<input type="checkbox" bind:checked={form.draft} class="size-4" />
			Rascunho (fica fora do site)
		</label>

		<label class="flex items-center gap-2 text-sm font-semibold md:col-span-2">
			<input type="checkbox" bind:checked={announce} disabled={form.draft} class="size-4" />
			Avisar assinantes da newsletter quando o post estiver no ar
		</label>

		<div class="md:col-span-2">
			<ImageField id="cover" label="Capa" folder="covers" options={covers} bind:value={form.cover} />
		</div>
	</div>

	<div class="{ui.card} space-y-3">
		<div class="flex flex-wrap items-end justify-between gap-3">
			<label for="body" class={ui.label}>Conteúdo (Markdown)</label>
			<div class="flex items-end gap-2">
				<div>
					<label for="list" class="block text-xs font-medium">Lista de produtos</label>
					<select id="list" bind:value={list} class={ui.input}>
						<option value="">Escolha...</option>
						{#each lists as name (name)}
							<option value={name}>{name}</option>
						{/each}
					</select>
				</div>
				<button type="button" onclick={insertList} disabled={!list} class={ui.button}>Inserir lista</button>
			</div>
		</div>
		<div class="grid gap-4 lg:grid-cols-2">
			<textarea
				id="body"
				bind:this={textarea}
				bind:value={form.body}
				required
				rows="24"
				spellcheck="true"
				class="{ui.input} font-mono"
			></textarea>
			<iframe
				title="Pré-visualização"
				sandbox=""
				srcdoc={preview}
				class="mt-1 h-full min-h-96 w-full rounded-lg border border-gray-300 bg-white dark:border-zinc-700"
			></iframe>
		</div>
		<p class="text-xs text-gray-500">
			Não use chaves no texto. A pré-visualização mostra o Markdown; os cartões de produto aparecem no site.
		</p>
	</div>

	<fieldset class="{ui.card} space-y-3">
		<legend class="px-1 text-sm font-semibold">Perguntas frequentes (FAQ)</legend>
		{#each form.faqData as item, index (index)}
			<div class="grid gap-2 md:grid-cols-[1fr_2fr_auto]">
				<input
					aria-label="Pergunta {index + 1}"
					placeholder="Pergunta"
					bind:value={item.question}
					required
					class={ui.input}
				/>
				<textarea
					aria-label="Resposta {index + 1}"
					placeholder="Resposta"
					bind:value={item.answer}
					required
					rows="2"
					class={ui.input}
				></textarea>
				<button
					type="button"
					aria-label="Remover pergunta {index + 1}"
					onclick={() => form.faqData.splice(index, 1)}
					class="{ui.button} mt-1 self-start"
				>
					<Trash2 size={14} aria-hidden="true" />
				</button>
			</div>
		{/each}
		<button type="button" onclick={() => form.faqData.push({ question: "", answer: "" })} class={ui.button}>
			<Plus size={14} aria-hidden="true" /> Adicionar pergunta
		</button>
	</fieldset>
</form>
