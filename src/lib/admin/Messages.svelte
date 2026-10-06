<script lang="ts">
	let { errors = [], success = "" }: { errors?: string[]; success?: string } = $props();
</script>

{#if errors.length > 0}
	<ul
		role="alert"
		class="space-y-1 rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950"
	>
		{#each errors as message (message)}
			<li class="text-sm text-red-700 dark:text-red-300">{message}</li>
		{/each}
	</ul>
{:else if success}
	<p
		role="status"
		class="rounded-lg border border-green-300 bg-green-50 px-4 py-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950 dark:text-green-300"
	>
		{success}
	</p>
{/if}
