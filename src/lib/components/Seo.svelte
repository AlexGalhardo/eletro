<script lang="ts">
	import { absoluteUrl, serializeJsonLd } from "#lib/seo/jsonld.ts";
	import { site } from "#lib/site.config.ts";

	type Props = {
		title: string;
		description: string;
		/** Site path of the page, used for the canonical URL. */
		path: string;
		image?: string;
		type?: "website" | "article";
		publishedTime?: string;
		noindex?: boolean;
		jsonLd?: Record<string, unknown>[];
	};

	let {
		title,
		description,
		path,
		image = site.ogImage,
		type = "website",
		publishedTime,
		noindex = false,
		jsonLd = [],
	}: Props = $props();

	const url = $derived(absoluteUrl(path));
	const imageUrl = $derived(absoluteUrl(image || site.ogImage));
</script>

<svelte:head>
	<title>{title}</title>
	<meta name="description" content={description} />
	<link rel="canonical" href={url} />
	{#if noindex}
		<meta name="robots" content="noindex, nofollow" />
	{/if}

	<meta property="og:title" content={title} />
	<meta property="og:description" content={description} />
	<meta property="og:url" content={url} />
	<meta property="og:site_name" content={site.domain} />
	<meta property="og:image" content={imageUrl} />
	<meta property="og:locale" content={site.locale.replace("-", "_")} />
	<meta property="og:type" content={type} />
	{#if publishedTime}
		<meta property="article:published_time" content={publishedTime} />
	{/if}

	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={title} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={imageUrl} />

	{#each jsonLd as data (data["@type"])}
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- serializeJsonLd escapes `<`. -->
		{@html `<script type="application/ld+json">${serializeJsonLd(data)}</${"script"}>`}
	{/each}
</svelte:head>
