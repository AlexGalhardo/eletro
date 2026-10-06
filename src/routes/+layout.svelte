<script lang="ts">
	import "../app.css";
	import LoadingBar from "#lib/components/LoadingBar.svelte";
	import { site } from "#lib/site.config.ts";
	import { dev } from "$app/env";
	import { page } from "$app/state";

	let { children } = $props();

	const { googleAnalyticsId, clarityId, googleSiteVerification } = site.analytics;

	const analytics = [
		googleAnalyticsId &&
			`window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)}gtag("js",new Date());gtag("config","${googleAnalyticsId}");`,
		clarityId &&
			`(function(c,l,a,r,i,t,y){c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y)})(window,document,"clarity","script","${clarityId}");`,
	]
		.filter(Boolean)
		.join("");
</script>

<svelte:head>
	<link rel="icon" href={site.logo} />
	<meta name="keywords" content={site.keywords.join(", ")} />
	<meta name="author" content={site.domain} />
	{#if googleSiteVerification}
		<meta name="google-site-verification" content={googleSiteVerification} />
	{/if}
	<!-- Trackers stay out of development, tests and the admin so only real visits reach the reports. -->
	{#if !dev && !page.url.pathname.startsWith("/admin")}
		{#if googleAnalyticsId}
			<script async src="https://www.googletagmanager.com/gtag/js?id={googleAnalyticsId}"></script>
		{/if}
		{#if analytics}
			{@html `<script>${analytics}</` + "script>"}
		{/if}
	{/if}
</svelte:head>

<LoadingBar />

{@render children()}
