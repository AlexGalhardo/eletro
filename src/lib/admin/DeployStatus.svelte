<script lang="ts">
	import { invalidateAll } from "$app/navigation";

	let { deployed, kind }: { deployed: boolean; kind: "github" | "local" } = $props();

	// While a deploy is on its way, the page data is reloaded until the new build answers.
	$effect(() => {
		if (deployed || kind !== "github") return;
		const timer = setInterval(invalidateAll, 20_000);
		return () => clearInterval(timer);
	});
</script>

<p role="status" class="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
	<span
		aria-hidden="true"
		class="size-2.5 rounded-full {deployed ? 'bg-green-500' : 'animate-pulse bg-amber-500'}"
	></span>
	{#if deployed}
		No ar: o site publicado está com esta versão.
	{:else if kind === "github"}
		Publicando: o deploy leva de 1 a 2 minutos.
	{:else}
		Salvo no disco local: aparece no site no próximo build.
	{/if}
</p>
