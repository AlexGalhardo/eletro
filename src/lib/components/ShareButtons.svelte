<script lang="ts">
	import type { IconName } from "#lib/icons/icons.ts";
	import Icon from "./Icon.svelte";

	let { url, title }: { url: string; title: string } = $props();

	let copied = $state<"success" | "error" | null>(null);
	let timer: ReturnType<typeof setTimeout> | undefined;

	const links = $derived.by(() => {
		const u = encodeURIComponent(url);
		const t = encodeURIComponent(title);
		const list: { name: string; href: string; color: string; icon: IconName }[] = [
			{
				name: "Twitter",
				href: `https://twitter.com/intent/tweet?url=${u}&text=${t}`,
				color: "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
				icon: "xTwitter",
			},
			{
				name: "Facebook",
				href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
				color: "bg-blue-600 hover:bg-blue-700",
				icon: "facebookF",
			},
			{
				name: "WhatsApp",
				href: `https://wa.me/?text=${t}%20${u}`,
				color: "bg-green-500 hover:bg-green-600",
				icon: "whatsapp",
			},
			{
				name: "Telegram",
				href: `https://t.me/share/url?url=${u}&text=${t}`,
				color: "bg-blue-400 hover:bg-blue-500",
				icon: "telegram",
			},
			{
				name: "LinkedIn",
				href: `https://www.linkedin.com/sharing/share-offsite/?url=${u}`,
				color: "bg-blue-700 hover:bg-blue-800",
				icon: "linkedinIn",
			},
			{
				name: "Reddit",
				href: `https://www.reddit.com/submit?url=${u}&title=${t}`,
				color: "bg-orange-500 hover:bg-orange-600",
				icon: "reddit",
			},
			{
				name: "Pinterest",
				href: `https://pinterest.com/pin/create/button/?url=${u}&description=${t}`,
				color: "bg-red-600 hover:bg-red-700",
				icon: "pinterest",
			},
		];
		return list;
	});

	async function copy() {
		try {
			await navigator.clipboard.writeText(url);
			copied = "success";
		} catch {
			copied = "error";
		}
		clearTimeout(timer);
		timer = setTimeout(() => (copied = null), 2000);
	}
</script>

<div class="flex flex-nowrap items-center gap-1.5 overflow-x-auto sm:gap-2">
	{#each links as link (link.name)}
		<a
			href={link.href}
			target="_blank"
			rel="noopener noreferrer"
			class="{link.color} flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-[10px] text-white transition-all duration-200 hover:scale-110 sm:h-9 sm:w-9 sm:text-sm"
			title="Compartilhar no {link.name}"
			aria-label="Compartilhar no {link.name}"
		>
			<Icon name={link.icon} />
		</a>
	{/each}

	<div class="relative inline-flex">
		<button
			type="button"
			onclick={copy}
			class="flex h-8 w-8 items-center justify-center rounded-full bg-gray-600 text-sm font-bold text-white transition-colors hover:bg-gray-700"
			title="Copiar link"
			aria-label="Copiar link"
		>
			<Icon name={copied === "success" ? "check" : "copy"} />
		</button>

		{#if copied}
			<span
				class="absolute -top-8 left-1/2 -translate-x-1/2 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-white {copied ===
				'success'
					? 'bg-green-600'
					: 'bg-red-600'}"
				role="status"
			>
				{copied === "success" ? "Link copiado!" : "Erro ao copiar"}
			</span>
		{/if}
	</div>
</div>
