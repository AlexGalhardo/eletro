<script lang="ts">
	import { api, messagesOf, ui } from "#lib/admin/api.ts";
	import Messages from "#lib/admin/Messages.svelte";
	import { invalidateAll } from "$app/navigation";

	let { data } = $props();

	const SUBSCRIBER = { pending: "Aguardando confirmação", confirmed: "Confirmado", unsubscribed: "Saiu" } as const;
	const DISPATCH = { pending: "Na fila", sending: "Enviando", sent: "Enviado", failed: "Falhou" } as const;

	let busy = $state(false);
	let errors = $state<string[]>([]);
	let success = $state("");

	const day = (iso: string | null) => (iso ? iso.slice(0, 10).split("-").reverse().join("/") : "");

	async function act(run: () => Promise<string>) {
		busy = true;
		errors = [];
		success = "";
		try {
			success = await run();
			await invalidateAll();
		} catch (cause) {
			errors = messagesOf(cause);
		} finally {
			busy = false;
		}
	}

	const sendQueued = () =>
		act(async () => {
			const results = await api<{ slug: string; status: string; recipients: number }[]>(
				"POST",
				"/newsletter/dispatches/run",
			);
			if (results.length === 0) return "Não há envio na fila.";
			return results
				.map(({ slug, status, recipients }) =>
					status === "sent"
						? `${slug}: enviado para ${recipients} assinante(s).`
						: status === "waiting"
							? `${slug}: o post ainda não está no ar.`
							: `${slug}: falhou depois de ${recipients} envio(s).`,
				)
				.join(" ");
		});

	const retry = (slug: string) =>
		act(async () => {
			await api("POST", "/newsletter/dispatches", { slug });
			return `${slug} voltou para a fila. Use "Enviar fila agora".`;
		});
</script>

<svelte:head>
	<title>Newsletter - Painel</title>
</svelte:head>

<div class="flex flex-wrap items-center justify-between gap-3">
	<h1 class="text-2xl font-bold">Newsletter</h1>
	<button type="button" onclick={sendQueued} disabled={busy} class={ui.primary}>
		{busy ? "Aguarde..." : "Enviar fila agora"}
	</button>
</div>

<div class="mt-4"><Messages {errors} {success} /></div>

<dl class="mt-6 grid grid-cols-3 gap-4">
	{#each Object.entries(SUBSCRIBER) as [status, label] (status)}
		<div class={ui.card}>
			<dt class="text-sm text-gray-600 dark:text-gray-400">{label}</dt>
			<dd class="mt-1 text-3xl font-bold">{data.totals[status] ?? 0}</dd>
		</div>
	{/each}
</dl>

<section class="mt-8">
	<h2 class="text-lg font-bold">Envios</h2>
	<p class="mt-1 text-sm text-gray-600 dark:text-gray-400">
		Um envio sai da fila quando o post já está no ar. Cada assinante recebe um post uma única vez.
	</p>
	<div class="{ui.card} mt-3 overflow-x-auto p-0">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400">
				<tr>
					<th scope="col" class="px-4 py-2 font-medium">Post</th>
					<th scope="col" class="px-4 py-2 font-medium">Status</th>
					<th scope="col" class="px-4 py-2 font-medium">Destinatários</th>
					<th scope="col" class="px-4 py-2 font-medium">Pedido</th>
					<th scope="col" class="px-4 py-2 font-medium">Enviado</th>
					<th scope="col" class="px-4 py-2 font-medium"><span class="sr-only">Ações</span></th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-zinc-800">
				{#each data.dispatches as dispatch (dispatch.slug)}
					<tr>
						<td class="px-4 py-2">
							<a href="/admin/posts/{dispatch.slug}" class="font-medium hover:underline">{dispatch.slug}</a>
							{#if dispatch.error}
								<span class="block text-xs text-red-600 dark:text-red-400">{dispatch.error}</span>
							{/if}
						</td>
						<td class="px-4 py-2 whitespace-nowrap">{DISPATCH[dispatch.status]}</td>
						<td class="px-4 py-2">{dispatch.recipients}</td>
						<td class="px-4 py-2 whitespace-nowrap">{day(dispatch.createdAt)}</td>
						<td class="px-4 py-2 whitespace-nowrap">{day(dispatch.sentAt)}</td>
						<td class="px-4 py-2 text-right">
							{#if dispatch.status === "failed" || dispatch.status === "sending"}
								<button
									type="button"
									onclick={() => retry(dispatch.slug)}
									disabled={busy}
									aria-label="Tentar de novo o envio de {dispatch.slug}"
									class={ui.button}
								>
									Tentar de novo
								</button>
							{/if}
						</td>
					</tr>
				{:else}
					<tr><td colspan="6" class="px-4 py-6 text-center text-gray-500">Nenhum envio pedido.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>

<section class="mt-8">
	<h2 class="text-lg font-bold">Assinantes</h2>
	<div class="{ui.card} mt-3 overflow-x-auto p-0">
		<table class="w-full text-left text-sm">
			<thead class="border-b border-gray-200 text-gray-600 dark:border-zinc-800 dark:text-gray-400">
				<tr>
					<th scope="col" class="px-4 py-2 font-medium">E-mail</th>
					<th scope="col" class="px-4 py-2 font-medium">Status</th>
					<th scope="col" class="px-4 py-2 font-medium">Desde</th>
				</tr>
			</thead>
			<tbody class="divide-y divide-gray-200 dark:divide-zinc-800">
				{#each data.subscribers as item (item.email)}
					<tr>
						<td class="px-4 py-2">{item.email}</td>
						<td class="px-4 py-2 whitespace-nowrap">{SUBSCRIBER[item.status]}</td>
						<td class="px-4 py-2 whitespace-nowrap">{day(item.createdAt)}</td>
					</tr>
				{:else}
					<tr><td colspan="3" class="px-4 py-6 text-center text-gray-500">Nenhum assinante ainda.</td></tr>
				{/each}
			</tbody>
		</table>
	</div>
</section>
