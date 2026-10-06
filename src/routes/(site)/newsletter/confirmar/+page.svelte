<script lang="ts">
	import { site } from "#lib/site.config.ts";

	let loading = $state(false);
	let result = $state<"done" | "invalid" | "error" | null>(null);

	// The page is static, so the token is read from the address only when the button is pressed.
	// Confirming takes a click instead of happening on load because e-mail scanners open every link they see.
	async function confirm() {
		loading = true;
		try {
			const response = await fetch("/api/v1/newsletter/confirm", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ token: new URLSearchParams(location.search).get("token") ?? "" }),
			});
			result = response.ok ? "done" : response.status >= 500 || response.status === 429 ? "error" : "invalid";
		} catch {
			result = "error";
		} finally {
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Confirmar inscrição - {site.name}</title>
	<meta name="robots" content="noindex" />
</svelte:head>

<main class="mx-auto max-w-xl px-4 py-16 text-center text-black dark:text-white">
	{#if result === "done"}
		<h1 class="mb-4 text-3xl font-bold">Inscrição confirmada</h1>
		<p role="status">Você vai receber um e-mail sempre que sair uma análise nova.</p>
	{:else}
		<h1 class="mb-4 text-3xl font-bold">Confirmar inscrição</h1>
		<p>Confirme para receber um e-mail sempre que sair uma análise nova no {site.name}.</p>
		<button
			type="button"
			onclick={confirm}
			disabled={loading}
			class="mt-6 rounded-lg bg-green-600 px-5 py-2.5 font-semibold text-white transition-colors hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? "Confirmando..." : "Confirmar minha inscrição"}
		</button>
		{#if result}
			<p role="alert" class="mt-4 text-sm! text-red-600 dark:text-red-400">
				{result === "invalid"
					? "Este link de confirmação não vale mais. Faça a inscrição de novo pelo formulário no rodapé."
					: "Não foi possível confirmar agora. Tente de novo em instantes."}
			</p>
		{/if}
	{/if}
	<a href="/" class="mt-6 block text-sm font-semibold text-blue-600 hover:underline dark:text-blue-400">
		Voltar para o início
	</a>
</main>
