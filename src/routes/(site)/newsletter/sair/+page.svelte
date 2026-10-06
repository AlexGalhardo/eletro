<script lang="ts">
	import { site } from "#lib/site.config.ts";

	let loading = $state(false);
	let result = $state<"done" | "invalid" | "error" | null>(null);

	// The page is static, so the token is read from the address only when the button is pressed.
	// Leaving takes a click instead of happening on load because e-mail scanners open every link they see.
	async function leave() {
		loading = true;
		try {
			const response = await fetch("/api/v1/newsletter/unsubscribe", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: new URLSearchParams(location.search).get("token") ?? "" }),
			});
			result = response.ok ? "done" : response.status === 500 ? "error" : "invalid";
		} catch {
			result = "error";
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Cancelar inscrição - {site.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-16 text-center text-black dark:text-white">
	{#if result === "done"}
		<h1 class="mb-4 text-3xl font-bold">Inscrição cancelada</h1>
		<p role="status">Você não vai mais receber e-mails do {site.name}.</p>
	{:else}
		<h1 class="mb-4 text-3xl font-bold">Cancelar inscrição</h1>
		<p>Confirme para parar de receber os e-mails do {site.name}.</p>
		<button
			type="button"
			onclick={leave}
			disabled={loading}
			class="mt-6 rounded-lg bg-red-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? "Cancelando..." : "Cancelar minha inscrição"}
		</button>
		{#if result}
			<p role="alert" class="mt-4 text-sm! text-red-600 dark:text-red-400">
				{result === "invalid"
					? "Este link não vale mais. Use o link do e-mail mais recente."
					: "Não foi possível cancelar agora. Tente de novo em instantes."}
			</p>
		{/if}
	{/if}
</main>
