<script lang="ts">
	let email = $state("");
	let loading = $state(false);
	let status = $state<{ type: "success" | "error"; text: string } | null>(null);

	async function submit(event: SubmitEvent) {
		event.preventDefault();
		loading = true;
		status = null;
		try {
			const response = await fetch("/api/v1/newsletter/subscribers", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ email }),
			});
			if (!response.ok) throw new Error(`Subscription request failed with ${response.status}`);
			status = { type: "success", text: "Quase lá: confirme a inscrição pelo link que enviamos ao seu e-mail." };
			email = "";
		} catch {
			status = { type: "error", text: "Não foi possível inscrever agora. Confira o e-mail e tente de novo." };
		} finally {
			loading = false;
		}
	}
</script>

<form onsubmit={submit} class="max-w-md">
	<label
		for="newsletter-email"
		class="text-xs font-bold tracking-wider text-gray-600 uppercase dark:text-gray-400"
	>
		Receba as novas análises por e-mail
	</label>
	<div class="mt-3 flex gap-2">
		<input
			id="newsletter-email"
			type="email"
			name="email"
			autocomplete="email"
			required
			placeholder="seuemail@email.com"
			bind:value={email}
			class="w-full rounded-lg border border-gray-300 bg-white px-3.5 py-2.5 text-sm text-black placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/40 focus:outline-none dark:border-zinc-700 dark:bg-zinc-900 dark:text-white"
		/>
		<button
			type="submit"
			disabled={loading}
			class="shrink-0 rounded-lg bg-green-700 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-green-800 disabled:cursor-not-allowed disabled:opacity-60"
		>
			{loading ? "Enviando..." : "Inscrever"}
		</button>
	</div>
	{#if status}
		<p
			role="status"
			class="mt-3 text-sm! {status.type === 'success'
				? 'text-green-700 dark:text-green-400'
				: 'text-red-600 dark:text-red-400'}"
		>
			{status.text}
		</p>
	{/if}
</form>
