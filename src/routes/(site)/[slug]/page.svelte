<script lang="ts">
	import { Calendar, Clock, Share2 } from "@lucide/svelte";
	import { setContext } from "svelte";
	import AuthorCard from "#lib/components/AuthorCard.svelte";
	import CardsTable from "#lib/components/CardsTable.svelte";
	import ReadingProgress from "#lib/components/ReadingProgress.svelte";
	import Seo from "#lib/components/Seo.svelte";
	import ShareButtons from "#lib/components/ShareButtons.svelte";
	import { coverSrcset } from "#lib/content/cover.ts";
	import type { BodySegment } from "#lib/content/render-body.ts";
	import type { Post, Product } from "#lib/content/schema.ts";
	import { formatDate, readingTimeLabel } from "#lib/format.ts";
	import { absoluteUrl, postJsonLd } from "#lib/seo/jsonld.ts";

	let {
		data,
	}: {
		data: {
			post: Post;
			coverWidths: number[];
			productLists: Record<string, Product[]>;
			segments: BodySegment[];
		};
	} = $props();

	const post = $derived(data.post);
	const shareUrl = $derived(absoluteUrl(`/${post.slug}`));

	// Read by <CardsTable> inside the post body. A getter keeps it reactive across navigations.
	setContext("productLists", () => data.productLists);
	// The post slug is part of the id each product has in the links dashboard.
	setContext("postSlug", () => data.post.slug);

	// Copy protection is a deterrent the site owner asked to keep; it is not a security control.
	function protect(node: HTMLElement) {
		const block = (event: Event) => event.preventDefault();
		const events = ["copy", "cut", "contextmenu", "dragstart"];
		for (const name of events) node.addEventListener(name, block);
		return () => {
			for (const name of events) node.removeEventListener(name, block);
		};
	}
</script>

<Seo
	title={post.title}
	description={post.description}
	path="/{post.slug}"
	image={post.cover}
	type="article"
	publishedTime={post.date}
	jsonLd={postJsonLd(post)}
/>

<ReadingProgress />

<div class="min-h-screen dark:bg-black">
	<div class="mx-auto max-w-3xl">
		<div class="flex justify-center">
			<main class="mt-6 w-full max-w-5xl">
				<article class="bg-white p-6 dark:bg-black">
					<header class="mb-8">
						<h1
							class="mb-4 text-3xl leading-tight font-bold text-gray-900 sm:text-2xl md:text-3xl dark:text-white"
						>
							{post.title}
						</h1>

						{#if post.description}
							<p class="mb-6 text-lg leading-relaxed text-gray-600 sm:text-xl dark:text-white">
								{post.description}
							</p>
						{/if}

						<div
							class="flex flex-wrap items-center justify-between gap-3 pb-6 text-sm text-gray-600 uppercase dark:text-white"
						>
							<time datetime={post.date} class="flex items-center gap-1.5">
								<Calendar class="h-4 w-4" />
								<span>POSTADO EM {formatDate(post.date)}</span>
							</time>

							<span class="flex items-center gap-1.5">
								<Clock class="h-4 w-4" />
								<span>{readingTimeLabel(post.readingMinutes)}</span>
							</span>
						</div>
					</header>

					<div class="mb-8">
						<div class="mb-4 flex items-center gap-2">
							<Share2 class="h-5 w-5 shrink-0 text-gray-700 dark:text-white" />
							<span class="text-sm font-medium text-gray-700 dark:text-white">
								COMPARTILHE COM MAIS PESSOAS:
							</span>
						</div>
						<ShareButtons url={shareUrl} title={post.title} />
					</div>

					{#if post.cover}
						<div class="relative mb-8 aspect-video w-full overflow-hidden bg-gray-100 dark:bg-black">
							<img
								src={post.cover}
								srcset={coverSrcset(post.cover, data.coverWidths)}
								sizes="(min-width: 1024px) 1024px, 100vw"
								alt={post.title}
								fetchpriority="high"
								class="absolute inset-0 h-full w-full object-cover"
							/>
						</div>
					{/if}

					<div
						id="blog-content-protected"
						{@attach protect}
						class="mb-8 max-w-none select-none"
					>
						{#each data.segments as segment, index (index)}
							{#if segment.kind === "html"}
								{@html segment.html}
							{:else}
								<CardsTable list={segment.list} />
							{/if}
						{/each}
					</div>

					<AuthorCard id={post.author} />

					<div class="mt-6 border-gray-200 pt-6 dark:border-zinc-800">
						<div class="mb-4 flex items-center gap-2">
							<Share2 class="h-5 w-5 shrink-0 text-gray-700 dark:text-white" />
							<span class="text-sm font-medium text-gray-700 dark:text-white">
								COMPARTILHE COM MAIS PESSOAS:
							</span>
						</div>
						<ShareButtons url={shareUrl} title={post.title} />
					</div>
				</article>
			</main>
		</div>
	</div>
</div>
