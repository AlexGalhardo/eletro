<script lang="ts">
	import { site } from "#lib/site.config.ts";
	import { page } from "$app/state";

	let { data } = $props();

	let loading = $state(false);
	// better-auth sends the visitor back here with `?error=` when the account was refused.
	let failed = $state(page.url.searchParams.has("error"));

	async function signIn() {
		loading = true;
		failed = false;
		try {
			const response = await fetch("/api/auth/sign-in/social", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					provider: "github",
					callbackURL: "/admin",
					errorCallbackURL: "/admin/login",
				}),
			});
			const { url } = (await response.json()) as { url?: string };
			if (!response.ok || !url) throw new Error(`Sign-in request failed with ${response.status}`);
			location.href = url;
		} catch {
			failed = true;
			loading = false;
		}
	}
</script>

<svelte:head>
	<title>Entrar - {site.name}</title>
</svelte:head>

<div class="mx-auto mt-16 max-w-sm rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-zinc-800 dark:bg-zinc-950">
	<h1 class="font-russo-one text-2xl">{site.name} <span class="text-blue-600">Admin</span></h1>

	{#if data.missing.length > 0}
		<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
			O painel ainda não está configurado. Defina as variáveis de ambiente abaixo e reinicie o servidor.
		</p>
		<ul class="mt-4 space-y-1">
			{#each data.missing as name (name)}
				<li class="font-mono text-sm">{name}</li>
			{/each}
		</ul>
	{:else if data.github}
		<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Acesso restrito a quem administra o site.</p>
		<button
			type="button"
			onclick={signIn}
			disabled={loading}
			class="mt-6 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
		>
			{loading ? "Redirecionando..." : "Entrar com GitHub"}
		</button>
	{:else}
		<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">
			O login pelo GitHub não está configurado. Só o login de testes está ativo.
		</p>
	{/if}

	{#if failed}
		<p role="alert" class="mt-4 text-sm text-red-600 dark:text-red-400">
			Não foi possível entrar. Confira se o seu usuário do GitHub está na lista de administradores.
		</p>
	{/if}
</div>
