<script lang="ts">
	import { Home, Info, Mail, Newspaper, X } from "@lucide/svelte";
	import { site } from "#lib/site.config.ts";
	import CategoryIcon from "./CategoryIcon.svelte";

	// Ids of the categories with a published post: the others would open an empty list.
	let { open, onclose, categories }: { open: boolean; onclose: () => void; categories: string[] } = $props();

	const categoryLinks = $derived([
		{ id: "all", label: "Todos", icon: "layers", href: "/" },
		...site.categories
			.filter((category) => categories.includes(category.id))
			.map((category) => ({ ...category, href: `/?categoria=${category.id}` })),
	]);

	// Read when the menu opens: the home page filter lives in the URL (?categoria=).
	let current = $state("");
	$effect(() => {
		if (!open) return;
		const url = new URL(window.location.href);
		current = url.pathname === "/" ? (url.searchParams.get("categoria") ?? "all") : "";
	});

	const links = [
		{ href: "/", label: "Início", icon: Home },
		{ href: "/sobre", label: "Sobre", icon: Info },
		{ href: "/contato", label: "Contato", icon: Mail },
		{ href: "/politica-de-privacidade", label: "Política de Privacidade", icon: Newspaper },
		{ href: "/termos-de-uso", label: "Termos de Uso", icon: Newspaper },
	];

	$effect(() => {
		document.body.style.overflow = open ? "hidden" : "";
		return () => {
			document.body.style.overflow = "";
		};
	});
</script>

<svelte:window onkeydown={(event) => open && event.key === "Escape" && onclose()} />

{#if open}
	<div class="fixed inset-0 z-[60] bg-black/40 backdrop-blur-sm" onclick={onclose} aria-hidden="true"></div>

	<div
		class="fixed top-0 left-0 z-[70] flex h-full w-80 max-w-[85vw] flex-col overflow-hidden border-r border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
		role="dialog"
		aria-modal="true"
		aria-label="Menu"
	>
		<div class="flex shrink-0 items-center justify-between border-b border-gray-200 p-4 dark:border-zinc-800">
			<a href="/" onclick={onclose} class="flex items-center gap-2">
				<img src={site.logo} alt="Logo" width="32" height="32" />
				<span class="font-russo-one text-sm text-black uppercase dark:text-white">
					{site.logoText.join(" ")}
				</span>
			</a>
			<button
				type="button"
				onclick={onclose}
				aria-label="Fechar menu"
				class="inline-flex h-9 w-9 items-center justify-center rounded-lg text-gray-700 transition-colors hover:bg-gray-100 dark:text-white dark:hover:bg-zinc-900"
			>
				<X class="h-5 w-5" />
			</button>
		</div>

		<nav class="flex-1 space-y-1 overflow-y-auto p-4">
			{#each links as link (link.href)}
				<a
					href={link.href}
					onclick={onclose}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold text-gray-800 transition-colors hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-900"
				>
					<link.icon class="h-5 w-5 text-blue-600 dark:text-blue-500" />
					{link.label}
				</a>
			{/each}

			<h2 class="px-3 pt-5 pb-1 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
				Categorias
			</h2>
			{#each categoryLinks as category (category.id)}
				<a
					href={category.href}
					onclick={onclose}
					aria-current={current === category.id ? "page" : undefined}
					class="flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors {current ===
					category.id
						? 'bg-blue-600 text-white'
						: 'text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-900'}"
				>
					<CategoryIcon name={category.icon} class="h-5 w-5 {current === category.id ? '' : 'text-blue-600 dark:text-blue-500'}" />
					{category.label}
				</a>
			{/each}
		</nav>
	</div>
{/if}
