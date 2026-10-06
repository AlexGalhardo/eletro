<script lang="ts">
	import { type IconName, icons } from "#lib/icons/icons.ts";

	let { name, class: className = "" }: { name: IconName; class?: string } = $props();

	const icon = $derived(icons[name]);
</script>

<svg
	class={className}
	viewBox={icon.viewBox}
	width="1em"
	height="1em"
	fill="currentColor"
	stroke="currentColor"
	stroke-width="0"
	aria-hidden="true"
>
	{#each icon.paths as d (d)}
		<path {d} />
	{/each}
</svg>
