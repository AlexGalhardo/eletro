<script lang="ts">
	import { ExternalLink, LogOut } from "@lucide/svelte";
	import { site } from "#lib/site.config.ts";
	import { page } from "$app/state";

	let { data, children } = $props();

	const links = [{ href: "/admin", label: "Painel" }];

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
			<div class="mx-auto flex max-w-6xl flex-wrap items-center gap-x-6 gap-y-2 px-4 py-3">
				<a href="/admin" class="font-russo-one text-lg">{site.name} <span class="text-blue-600">Admin</span></a>

				<nav aria-label="Painel" class="flex flex-1 flex-wrap gap-1">
					{#each links as link (link.href)}
						<a
							href={link.href}
							aria-current={isCurrent(link.href) ? "page" : undefined}
							class="rounded-md px-3 py-1.5 text-sm font-medium hover:bg-gray-100 aria-[current=page]:bg-gray-100 dark:hover:bg-zinc-800 dark:aria-[current=page]:bg-zinc-800"
						>
							{link.label}
						</a>
					{/each}
				</nav>

				<a
					href="/"
					target="_blank"
					rel="noopener"
					class="flex items-center gap-1 text-sm text-gray-600 hover:underline dark:text-gray-400"
				>
					Ver site <ExternalLink size={14} aria-hidden="true" />
				</a>
				<span class="text-sm text-gray-600 dark:text-gray-400">{data.admin.githubLogin}</span>
				<button
					type="button"
					onclick={signOut}
					class="flex items-center gap-1 rounded-md border border-gray-300 px-3 py-1.5 text-sm font-medium hover:bg-gray-100 dark:border-zinc-700 dark:hover:bg-zinc-800"
				>
					<LogOut size={14} aria-hidden="true" /> Sair
				</button>
			</div>
		</header>
	{/if}

	<main class="mx-auto max-w-6xl px-4 py-8">
		{@render children()}
	</main>
</div>
