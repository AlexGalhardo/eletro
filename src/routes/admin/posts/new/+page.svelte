<script lang="ts">
	import PostEditor from "#lib/admin/PostEditor.svelte";
	import { site } from "#lib/site.config.ts";

	let { data } = $props();

	const post = {
		title: "",
		description: "",
		date: new Date().toISOString().slice(0, 10),
		category: site.categories[0].id,
		cover: "",
		draft: false,
		author: site.defaultAuthor,
		faqData: [],
		body: "",
	};
</script>

<svelte:head>
	<title>Novo post - Painel</title>
</svelte:head>

<PostEditor {post} lists={data.lists} covers={data.covers} kind={data.kind} />
