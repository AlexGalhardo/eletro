<script lang="ts">
	import Seo from "#lib/components/Seo.svelte";
	import { contactSchema } from "#lib/contact.ts";
	import { site } from "#lib/site.config.ts";

	let form = $state({ name: "", email: "", message: "" });
	let errors = $state<Record<string, boolean>>({});
	let loading = $state(false);
	let status = $state<{ type: "success" | "error"; text: string } | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	function show(type: "success" | "error", text: string) {
		clearTimeout(timer);
		status = { type, text };
		timer = setTimeout(() => (status = null), 10000);
	}

	async function submit(event: SubmitEvent) {
		event.preventDefault();

		const parsed = contactSchema.safeParse(form);
		errors = parsed.success
			? {}
			: Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), true]));
		if (!parsed.success) return;

		loading = true;
		try {
			const response = await fetch("/api/v1/contact", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(parsed.data),
			});
			if (!response.ok) throw new Error(`Contact request failed with ${response.status}`);
			show("success", "Mensagem enviada com sucesso!");
			form = { name: "", email: "", message: "" };
		} catch {
			show("error", "Erro ao enviar mensagem. Tente novamente mais tarde.");
		} finally {
			loading = false;
		}
	}

	const input = (hasError: boolean | undefined) =>
		`w-full rounded-lg px-3.5 py-2.5 text-sm bg-white dark:bg-zinc-900 border text-black dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-colors ${
			hasError ? "border-red-500" : "border-gray-300 dark:border-zinc-700 focus:border-blue-500"
		}`;
	const label = "block text-sm font-semibold text-black dark:text-white";
</script>

<Seo
	title="Entre em Contato - {site.name}.com.br"
	description="Formulário de contato do site {site.name}.com.br"
	path="/contato"
/>

<main class="mx-auto max-w-xl px-4 py-12 text-black dark:text-white">
	<h1 class="mb-8 text-center text-4xl font-bold text-black dark:text-white">
		Tem uma pergunta? <br />
		Encontrou algum problema? <br />
	</h1>
	<p class="mb-8 text-center text-xl text-black dark:text-white">
		Preencha o formulário abaixo e nos envie uma mensagem.
	</p>

	<form onsubmit={submit} novalidate class="mx-auto max-w-2xl space-y-6">
		<div class="space-y-2">
			<label for="name" class={label}>Seu nome</label>
			<input
				id="name"
				name="name"
				autocomplete="name"
				placeholder="Seu nome"
				bind:value={form.name}
				aria-invalid={errors.name}
				class={input(errors.name)}
			/>
			{#if errors.name}<p class="text-sm text-red-500">Nome é obrigatório</p>{/if}
		</div>

		<div class="space-y-2">
			<label for="email" class={label}>Seu email</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				placeholder="seuemail@email.com"
				bind:value={form.email}
				aria-invalid={errors.email}
				class={input(errors.email)}
			/>
			{#if errors.email}<p class="text-sm text-red-500">Email inválido</p>{/if}
		</div>

		<div class="space-y-2">
			<label for="message" class={label}>Mensagem</label>
			<textarea
				id="message"
				name="message"
				placeholder="Digite sua mensagem"
				rows="6"
				bind:value={form.message}
				aria-invalid={errors.message}
				class={input(errors.message)}
			></textarea>
			{#if errors.message}
				<p class="text-sm text-red-500">A mensagem deve ter pelo menos 32 caracteres</p>
			{/if}
		</div>

		<button
			type="submit"
			disabled={loading}
			class="w-full rounded-lg bg-green-700 py-2.5 font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? "Enviando..." : "Enviar Mensagem"}
		</button>

		{#if status}
			<div
				role="status"
				class="w-full rounded-md border px-4 py-3 text-center text-sm {status.type === 'success'
					? 'border-green-500 bg-green-100 text-green-700 dark:border-green-600 dark:bg-green-900/30 dark:text-green-400'
					: 'border-red-500 bg-red-100 text-red-700 dark:border-red-600 dark:bg-red-900/30 dark:text-red-400'}"
			>
				{status.text}
			</div>
		{/if}
	</form>
</main>
