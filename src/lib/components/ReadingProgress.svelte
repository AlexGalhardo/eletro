<script lang="ts">
	let scrollY = $state(0);
	let progress = $state(0);

	$effect(() => {
		const height = document.documentElement.scrollHeight - document.documentElement.clientHeight;
		progress = height > 0 ? (scrollY / height) * 100 : 0;
	});
</script>

<svelte:window bind:scrollY />

<div class="pointer-events-none fixed top-0 left-0 z-60 h-1 w-full bg-transparent">
	<div
		class="h-full bg-linear-to-r from-green-500 to-green-600 transition-all duration-75 ease-linear"
		style="width: {progress}%"
	></div>
</div>
