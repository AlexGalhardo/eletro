<script lang="ts">
	import { ui } from "#lib/admin/api.ts";
	import { site } from "#lib/site.config.ts";
	import { page } from "$app/state";

	let { data } = $props();

	let loading = $state(false);
	// better-auth sends the visitor back here with `?error=` when the account was refused.
	let failed = $state(page.url.searchParams.has("error"));

	let local = $state({ githubLogin: "", token: "" });

	async function signInLocally(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		failed = false;
		try {
			const response = await fetch("/api/test/login", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify(local),
			});
			if (!response.ok) throw new Error(`Local sign-in failed with ${response.status}`);
			location.href = "/admin";
		} catch {
			failed = true;
			loading = false;
		}
	}

	async function signIn(provider: "github" | "google") {
		loading = true;
		failed = false;
		try {
			const response = await fetch("/api/auth/sign-in/social", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					provider,
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
	{:else if data.github || data.google}
		<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">Acesso restrito a quem administra o site.</p>
		{#if data.github}
			<button
				type="button"
				onclick={() => signIn("github")}
				disabled={loading}
				class="mt-6 w-full rounded-lg bg-black py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
			>
				{loading ? "Redirecionando..." : "Entrar com GitHub"}
			</button>
		{/if}
		{#if data.google}
			<button
				type="button"
				onclick={() => signIn("google")}
				disabled={loading}
				class="{data.github
					? 'mt-3'
					: 'mt-6'} w-full rounded-lg border border-gray-300 bg-white py-2.5 text-sm font-semibold text-black transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white dark:hover:bg-zinc-800"
			>
				{loading ? "Redirecionando..." : "Entrar com Google"}
			</button>
		{/if}
	{:else}
		<p class="mt-4 text-sm text-gray-600 dark:text-gray-400">O login pelo GitHub ou Google não está configurado.</p>
	{/if}

	{#if data.missing.length === 0 && data.local}
		<form onsubmit={signInLocally} class="mt-6 space-y-3 border-t border-gray-200 pt-6 text-left dark:border-zinc-800">
			<p class="text-xs text-gray-600 dark:text-gray-400">
				Entrada local, para desenvolvimento: existe só com o banco embutido e com AUTH_TEST_LOGIN_TOKEN definido.
			</p>
			<div>
				<label for="local-user" class={ui.label}>Usuário do GitHub</label>
				<input id="local-user" bind:value={local.githubLogin} required autocomplete="username" class={ui.input} />
			</div>
			<div>
				<label for="local-token" class={ui.label}>Token de teste</label>
				<input
					id="local-token"
					type="password"
					bind:value={local.token}
					required
					autocomplete="off"
					class={ui.input}
				/>
			</div>
			<button type="submit" disabled={loading} class="{ui.button} w-full">Entrar localmente</button>
		</form>
	{/if}

	{#if failed}
		<p role="alert" class="mt-4 text-sm text-red-600 dark:text-red-400">
			Não foi possível entrar. Confira se o seu usuário do GitHub ou o seu e-mail está na lista de administradores.
		</p>
	{/if}
</div>
