<script lang="ts">
	import { navigating } from "$app/state";

	// Width grows while a navigation is pending and snaps back when it settles.
	const active = $derived(navigating.to !== null);
</script>

{#if active}
	<div class="loading-bar" style="width: 70%" role="progressbar" aria-label="Carregando página"></div>
{/if}
