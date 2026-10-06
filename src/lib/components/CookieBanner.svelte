<script lang="ts">
	import { onMount } from "svelte";

	const COOKIE = "cookie_consent";

	let visible = $state(false);

	onMount(() => {
		visible = !document.cookie.split("; ").some((row) => row.startsWith(`${COOKIE}=`));
	});

	function accept() {
		const expires = new Date(Date.now() + 365 * 864e5).toUTCString();
		// biome-ignore lint/suspicious/noDocumentCookie: the Cookie Store API is not available in every browser yet.
		document.cookie = `${COOKIE}=true; expires=${expires}; path=/; SameSite=Lax`;
		visible = false;
	}
</script>

{#if visible}
	<div class="fixed bottom-6 left-1/2 z-50 w-full max-w-5xl -translate-x-1/2 transform px-4">
		<div
			class="flex flex-col items-center justify-between gap-4 rounded-xl border border-black bg-white p-4 text-center text-black shadow-lg md:flex-row"
		>
			<p class="text-sm font-medium">
				Nós usamos cookies para melhorar sua experiência no site. Saiba mais em
				<a href="/politica-de-privacidade" class="text-black underline hover:text-green-500">
					Cookies e Privacidade
				</a>
			</p>
			<button
				type="button"
				onclick={accept}
				class="rounded bg-green-700 px-4 py-2 text-sm font-bold text-white transition hover:bg-green-800"
			>
				OK
			</button>
		</div>
	</div>
{/if}
