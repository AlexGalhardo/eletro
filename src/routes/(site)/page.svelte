<script lang="ts">
	import { onMount } from "svelte";
	import CategoryIcon from "#lib/components/CategoryIcon.svelte";
	import CookieBanner from "#lib/components/CookieBanner.svelte";
	import Seo from "#lib/components/Seo.svelte";
	import { coverSrcset } from "#lib/content/cover.ts";
	import type { Post } from "#lib/content/schema.ts";
	import { formatDate } from "#lib/format.ts";
	import { homeJsonLd } from "#lib/seo/jsonld.ts";
	import { site } from "#lib/site.config.ts";
	import { page } from "$app/state";

	const POSTS_PER_LOAD = 8;

	type Card = Pick<Post, "slug" | "title" | "description" | "cover" | "date" | "category"> & {
		coverWidths: number[];
	};

	let { data }: { data: { posts: Card[]; jsonLdPosts: Post[]; activeCategories: string[] } } = $props();

	const categories = $derived([
		{ id: "all", label: "Todos", icon: "layers" },
		...site.categories.filter((category) => data.activeCategories.includes(category.id)),
	]);

	let selected = $state("all");
	let visibleCount = $state(POSTS_PER_LOAD);
	let sentinel = $state<HTMLElement>();

	const filtered = $derived(
		selected === "all" ? data.posts : data.posts.filter((post) => post.category === selected),
	);
	const visible = $derived(filtered.slice(0, visibleCount));
	const hasMore = $derived(visibleCount < filtered.length);

	function select(id: string) {
		selected = id;
		visibleCount = POSTS_PER_LOAD;
	}

	onMount(() => {
		// Footer links arrive as /?categoria=<id>. Read on the client because the page is prerendered.
		const fromUrl = page.url.searchParams.get("categoria");
		if (fromUrl && categories.some((category) => category.id === fromUrl)) select(fromUrl);
	});

	$effect(() => {
		if (!sentinel) return;
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && hasMore) visibleCount += POSTS_PER_LOAD;
			},
			// The top margin covers a jump straight to the end of the page (End key, a fast fling): the sentinel
			// is then above the viewport, hidden by the footer, and would otherwise never be seen crossing it.
			{ rootMargin: "2000px 0px 100px 0px" },
		);
		observer.observe(sentinel);
		return () => observer.disconnect();
	});
</script>

<Seo title={site.title} description={site.description} path="/" jsonLd={homeJsonLd(data.jsonLdPosts)} />

<CookieBanner />

<main class="min-h-screen bg-gray-50 text-black dark:bg-black dark:text-white">
	<!-- Desktop: a sticky sidebar on the left of the posts. Below lg the categories live in the hamburger menu. -->
	<div class="mx-auto max-w-6xl px-3 sm:px-6 lg:grid lg:grid-cols-[14rem_1fr] lg:items-start lg:gap-8 lg:px-8 lg:py-8">
		<aside
			aria-label="Filtrar por categoria"
			class="sticky top-24 hidden max-h-[calc(100vh-7rem)] overflow-y-auto rounded-2xl border border-gray-200 bg-white lg:block dark:border-zinc-800 dark:bg-zinc-950"
		>
			<h2 class="px-4 pt-4 text-xs font-bold tracking-wide text-gray-500 uppercase dark:text-gray-400">
				Categorias
			</h2>
			<div
				class="flex flex-col gap-1.5 p-3"
			>
				{#each categories as category (category.id)}
					<button
						type="button"
						onclick={() => select(category.id)}
						aria-pressed={selected === category.id}
						class="flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold tracking-wide whitespace-nowrap uppercase transition-colors duration-200 {selected ===
						category.id
							? 'border-blue-600 bg-blue-600 text-white'
							: 'border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-gray-300 dark:hover:text-blue-400'}"
					>
						<CategoryIcon name={category.icon} class="h-3.5 w-3.5" />
						{category.label}
					</button>
				{/each}
			</div>
		</aside>

	<div class="py-8 lg:py-0">
		{#if selected !== "all"}
			<p class="mb-4 text-sm text-gray-600 lg:hidden dark:text-gray-400" aria-live="polite">
				Categoria: <strong class="text-gray-900 dark:text-white">{categories.find((category) => category.id === selected)?.label}</strong>
				·
				<button type="button" onclick={() => select("all")} class="cursor-pointer text-blue-600 underline dark:text-blue-400">
					Ver todas
				</button>
			</p>
		{/if}
		<div class="grid grid-cols-1 gap-5 sm:grid-cols-2 sm:gap-6">
			{#each visible as post, index (post.slug)}
				<a
					href="/{post.slug}"
					data-sveltekit-preload-data="tap"
					class="group flex flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl dark:border-zinc-800 dark:bg-zinc-950"
				>
					{#if post.cover}
						<div
							class="relative aspect-video w-full shrink-0 overflow-hidden bg-gray-100 dark:bg-zinc-900"
						>
							<img
								src={post.cover}
								srcset={coverSrcset(post.cover, post.coverWidths)}
								sizes="(min-width: 1024px) 420px, (min-width: 640px) 50vw, 100vw"
								alt={post.title}
								decoding="async"
								loading={index < 2 ? "eager" : "lazy"}
								fetchpriority={index < 2 ? "high" : "auto"}
								class="absolute inset-0 h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
							/>
						</div>
					{/if}

					<div class="flex flex-1 flex-col gap-2 p-4">
						<span class="text-[11px] font-medium text-gray-600 dark:text-gray-400">
							POSTADO EM {formatDate(post.date).toUpperCase()}
						</span>

						<h3
							class="line-clamp-2 text-base leading-snug font-bold text-gray-900 transition-colors duration-300 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400"
						>
							{post.title}
						</h3>

						<p class="line-clamp-2 flex-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300">
							{post.description}
						</p>
					</div>
				</a>
			{:else}
				<div class="col-span-full py-20 text-center">
					<p class="text-lg text-gray-700 dark:text-white">Nenhuma postagem encontrada nesta categoria.</p>
				</div>
			{/each}
		</div>

		<div bind:this={sentinel} class="flex justify-center pt-8"></div>
	</div>
	</div>
</main>
