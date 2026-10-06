<script lang="ts">
	import PostEditor from "#lib/admin/PostEditor.svelte";

	let { data } = $props();
</script>

<svelte:head>
	<title>{data.post.title} - Painel</title>
</svelte:head>

{#key data.slug}
	<PostEditor
		slug={data.slug}
		sha={data.sha}
		post={data.post}
		lists={data.lists}
		covers={data.covers}
		deployed={data.deployed}
		kind={data.kind}
	/>
{/key}
