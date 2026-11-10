<script lang="ts">
	import {
		Baby,
		Bath,
		BedDouble,
		Layers,
		Lightbulb,
		Sofa,
		Sparkles,
		SprayCan,
		Sprout,
		Tag,
		UtensilsCrossed,
		WashingMachine,
		Wind,
		Wrench,
	} from "@lucide/svelte";

	// Icon names accepted in `site.categories[].icon`. Unknown names fall back to a tag.
	const map = {
		layers: Layers,
		wrench: Wrench,
		"spray-can": SprayCan,
		wind: Wind,
		sofa: Sofa,
		"washing-machine": WashingMachine,
		"utensils-crossed": UtensilsCrossed,
		sparkles: Sparkles,
		bath: Bath,
		"bed-double": BedDouble,
		lightbulb: Lightbulb,
		baby: Baby,
		sprout: Sprout,
	} as const;

	let { name, class: className = "" }: { name: string; class?: string } = $props();

	const Component = $derived(map[name as keyof typeof map] ?? Tag);
</script>

<Component class={className} />
