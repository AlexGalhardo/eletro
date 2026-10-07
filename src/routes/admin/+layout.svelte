<script lang="ts">
	import { ExternalLink, LogOut, Menu, Moon, Sun, X } from "@lucide/svelte";
	import { onMount } from "svelte";
	import { site } from "#lib/site.config.ts";
	import { syncTheme, theme, toggleTheme } from "#lib/theme.svelte.ts";
	import { page } from "$app/state";

	let { data, children } = $props();

	const links = [
		{ href: "/admin", label: "Painel" },
		{ href: "/admin/posts", label: "Posts" },
		{ href: "/admin/products", label: "Produtos" },
		{ href: "/admin/media", label: "Mídia" },
		{ href: "/admin/newsletter", label: "Newsletter" },
		{ href: "/admin/import", label: "Importar" },
	];

	// Phones only: from `md` up the menu is always shown in the header row.
	let menuOpen = $state(false);

	// The same preference as the public site: one choice, stored once, for both.
	let mounted = $state(false);
	onMount(() => {
		syncTheme();
		mounted = true;
	});

	const isCurrent = (href: string) =>
		href === "/admin" ? page.url.pathname === href : page.url.pathname.startsWith(href);

	async function signOut() {
		await fetch("/api/auth/sign-out", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: "{}",
		});
		// A full navigation drops everything the client had loaded for the signed-in admin.
		location.href = "/admin/login";
	}
</script>

<svelte:head>
	<meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gray-50 text-black dark:bg-black dark:text-white">
	{#if data.admin}
		<header class="border-b border-gray-200 bg-white dark:border-zinc-800 dark:bg-zinc-950">
			<div class="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-6 gap-y-2 px-4 py-3">
				<a href="/admin" class="font-russo-one text-lg">{site.name} <span class="text-blue-600">Admin</span></a>

				<button
					type="button"
					onclick={() => (menuOpen = !menuOpen)}
					aria-expanded={menuOpen}
					aria-controls="admin-menu"
					aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
					class="flex h-10 w-10 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 md:hidden dark:border-zinc-700 dark:hover:bg-zinc-800"
				>
					{#if menuOpen}<X size={20} aria-hidden="true" />{:else}<Menu size={20} aria-hidden="true" />{/if}
				</button>

				<div
					id="admin-menu"
					class="{menuOpen
						? 'flex'
						: 'hidden'} w-full flex-col gap-3 border-t border-gray-200 pt-3 md:flex md:w-auto md:flex-1 md:flex-row md:items-center md:gap-6 md:border-0 md:pt-0 dark:border-zinc-800"
				>
					<nav aria-label="Painel" class="flex flex-col gap-1 md:flex-1 md:flex-row md:flex-wrap">
						{#each links as link (link.href)}
							<a
								href={link.href}
								onclick={() => (menuOpen = false)}
								aria-current={isCurrent(link.href) ? "page" : undefined}
								class="rounded-md px-3 py-2 text-base font-medium hover:bg-gray-100 aria-[current=page]:bg-gray-100 md:py-1.5 md:text-sm dark:hover:bg-zinc-800 dark:aria-[current=page]:bg-zinc-800"
							>
								{link.label}
							</a>
						{/each}
					</nav>

					<div class="flex flex-wrap items-center gap-x-4 gap-y-2 px-3 md:px-0">
						<a
							href="/"
							target="_blank"
							rel="noopener"
							class="flex items-center gap-1 text-sm text-gray-600 hover:underline dark:text-gray-400"
						>
							Ver site <ExternalLink size={14} aria-hidden="true" />
						</a>
						<span class="text-sm text-gray-600 dark:text-gray-400">{data.admin.githubLogin ?? data.admin.email}</span>
						<button
							type="button"
							onclick={toggleTheme}
							aria-label="Alternar tema"
							class="flex h-8 w-8 items-center justify-center rounded-md border border-gray-300 hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
						>
							{#if mounted}
								{#if theme.dark}<Sun size={16} aria-hidden="true" />{:else}<Moon size={16} aria-hidden="true" />{/if}
							{/if}
						</button>
						<button
							type="button"
							onclick={signOut}
							class="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
						>
							<LogOut size={14} aria-hidden="true" /> Sair
						</button>
					</div>
				</div>
			</div>
		</header>
	{/if}

	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
