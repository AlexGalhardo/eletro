<script lang="ts">
	import { Layers, Sofa, SprayCan, Tag, UtensilsCrossed, WashingMachine, Wind, Wrench } from "@lucide/svelte";

	// Icon names accepted in `site.categories[].icon`. Unknown names fall back to a tag.
	const map = {
		layers: Layers,
		wrench: Wrench,
		"spray-can": SprayCan,
		wind: Wind,
		sofa: Sofa,
		"washing-machine": WashingMachine,
		"utensils-crossed": UtensilsCrossed,
	} as const;

	let { name, class: className = "" }: { name: string; class?: string } = $props();

	const Component = $derived(map[name as keyof typeof map] ?? Tag);
</script>

<Component class={className} />
