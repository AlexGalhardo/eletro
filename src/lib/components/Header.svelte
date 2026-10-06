<script lang="ts">
	import { Menu, Moon, Search, Sun, X } from "@lucide/svelte";
	import Fuse from "fuse.js";
	import { onMount } from "svelte";
	import { site } from "#lib/site.config.ts";
	import { syncTheme, theme, toggleTheme } from "#lib/theme.svelte.ts";
	import { goto } from "$app/navigation";
	import MobileSidebar from "./MobileSidebar.svelte";

	type SearchItem = { slug: string; title: string };

	let { posts }: { posts: SearchItem[] } = $props();

	let searchTerm = $state("");
	let suggestionsOpen = $state(false);
	let mobileSearchOpen = $state(false);
	let selectedIndex = $state(-1);
	let sidebarOpen = $state(false);
	let mounted = $state(false);

	const normalize = (value: string) =>
		value
			.normalize("NFD")
			.replace(/[̀-ͯ]/g, "")
			.toLowerCase();

	const fuse = $derived(
		new Fuse(
			posts.map((post) => ({ ...post, normalized: normalize(post.title) })),
			{ keys: ["normalized"], threshold: 0.4, distance: 200, ignoreLocation: true },
		),
	);

	const results = $derived(
		searchTerm.length >= 2
			? fuse
					.search(normalize(searchTerm).trim())
					.slice(0, 6)
					.map((result) => result.item)
			: [],
	);

	$effect(() => {
		suggestionsOpen = results.length > 0 && searchTerm.length >= 3;
		selectedIndex = -1;
	});

	onMount(() => {
		syncTheme();
		mounted = true;
	});

	function select(post: SearchItem) {
		suggestionsOpen = false;
		searchTerm = "";
		mobileSearchOpen = false;
		goto(`/${post.slug}`);
	}

	function onKeydown(event: KeyboardEvent) {
		if (event.key === "Escape") {
			suggestionsOpen = false;
			selectedIndex = -1;
			mobileSearchOpen = false;
			return;
		}
		if (!suggestionsOpen || results.length === 0) return;

		if (event.key === "ArrowDown") {
			event.preventDefault();
			selectedIndex = selectedIndex < results.length - 1 ? selectedIndex + 1 : 0;
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : results.length - 1;
		} else if (event.key === "Enter") {
			event.preventDefault();
			const post = results[selectedIndex];
			if (post) select(post);
		}
	}

	function onFocus() {
		if (searchTerm.length >= 3 && results.length > 0) suggestionsOpen = true;
	}

	function closeOnOutsideClick(event: MouseEvent) {
		if (!(event.target as Element).closest("[data-search]")) {
			suggestionsOpen = false;
			selectedIndex = -1;
		}
	}

	const iconButton =
		"inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors";
</script>

<svelte:document onmousedown={closeOnOutsideClick} />

{#snippet suggestions()}
	<div
		class="absolute top-full right-0 left-0 z-50 mt-2 max-h-80 overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950"
		role="listbox"
	>
		{#each results as post, index (post.slug)}
			<div
				role="option"
				tabindex="-1"
				aria-selected={index === selectedIndex}
				class="cursor-pointer border-b border-gray-100 p-4 transition-colors duration-150 last:border-b-0 dark:border-zinc-900 {index ===
				selectedIndex
					? 'bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400'
					: 'text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-zinc-900'}"
				onmousedown={(event) => {
					event.preventDefault();
					select(post);
				}}
			>
				<div class="line-clamp-2 text-sm font-medium">{post.title}</div>
			</div>
		{/each}
	</div>
{/snippet}

<div
	class="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl dark:border-zinc-800 dark:bg-zinc-950/90"
>
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<header class="text-black dark:text-white">
			<div class="flex items-center justify-between gap-3 py-3.5 sm:gap-4">
				<button
					type="button"
					onclick={() => (sidebarOpen = true)}
					aria-label="Abrir menu"
					class="{iconButton} shrink-0 lg:hidden"
				>
					<Menu class="h-5 w-5" />
				</button>

				<div class="shrink-0">
					<a href="/" class="flex items-center gap-2 transition-opacity hover:opacity-80">
						<img src={site.logo} alt="Logo" width="36" height="36" />
						<span class="font-russo-one text-lg leading-none text-black uppercase dark:text-white">
							{site.logoText[0]}<span class="text-green-700 dark:text-green-500">{` ${site.logoText[1]}`}</span>
						</span>
					</a>
				</div>

				<div class="relative mx-2 hidden flex-1 lg:flex" data-search>
					<Search
						class="pointer-events-none absolute top-1/2 left-3.5 z-10 h-4 w-4 -translate-y-1/2 text-gray-400"
					/>
					<input
						type="text"
						aria-label="Buscar"
						placeholder="Buscar postagem, produto, marca..."
						bind:value={searchTerm}
						onkeydown={onKeydown}
						onfocus={onFocus}
						class="w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pr-4 pl-10 text-sm text-black transition-colors placeholder:text-gray-500 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none dark:border-zinc-800 dark:bg-zinc-900 dark:text-white dark:placeholder:text-gray-400 dark:focus:border-blue-500"
					/>
					{#if suggestionsOpen}
						{@render suggestions()}
					{/if}
				</div>

				<div class="ml-auto flex shrink-0 items-center gap-1 sm:gap-2">
					<button
						type="button"
						onclick={() => (mobileSearchOpen = !mobileSearchOpen)}
						aria-label="Buscar"
						class="{iconButton} lg:hidden"
					>
						{#if mobileSearchOpen}<X class="h-5 w-5" />{:else}<Search class="h-5 w-5" />{/if}
					</button>

					<button type="button" onclick={toggleTheme} aria-label="Alternar tema" class={iconButton}>
						{#if mounted}
							{#if theme.dark}<Sun class="h-5 w-5" />{:else}<Moon class="h-5 w-5" />{/if}
						{/if}
					</button>
				</div>
			</div>

			{#if mobileSearchOpen}
				<div class="pb-4 lg:hidden" data-search>
					<div class="relative">
						<Search
							class="pointer-events-none absolute top-1/2 left-3.5 z-10 h-4 w-4 -translate-y-1/2 text-gray-400"
						/>
						<input
							{@attach (node) => node.focus()}
							type="text"
							aria-label="Buscar"
							placeholder="Buscar postagem, produto, marca..."
							bind:value={searchTerm}
							onkeydown={onKeydown}
							onfocus={onFocus}
							class="w-full rounded-full border border-gray-200 bg-gray-100 py-2.5 pr-4 pl-10 text-sm text-black placeholder:text-gray-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-white"
						/>
						{#if suggestionsOpen}
							{@render suggestions()}
						{/if}
					</div>
				</div>
			{/if}
		</header>
	</div>
</div>

<MobileSidebar open={sidebarOpen} onclose={() => (sidebarOpen = false)} />
