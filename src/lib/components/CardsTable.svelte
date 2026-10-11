<script lang="ts">
	import { getContext, onMount } from "svelte";
	import { isAffiliateUrl, storeLinks } from "#lib/affiliate-links.ts";
	import { fallbackHref, productHref } from "#lib/content/affiliate.ts";
	import type { Product } from "#lib/content/schema.ts";
	import Icon from "./Icon.svelte";

	const MAX_PRODUCTS = 10;
	const MAX_ADVANTAGES = 5;

	let { list, shuffle = true }: { list: string; shuffle?: boolean } = $props();

	// The page that renders the post provides every list its body references (see routes/[slug]).
	const lists = getContext<(() => Record<string, Product[]>) | undefined>("productLists");
	const postSlug = getContext<(() => string) | undefined>("postSlug");

	let order = $state<string[] | null>(null);

	const products = $derived.by(() => {
		const top = (lists?.()[list] ?? []).slice(0, MAX_PRODUCTS);
		if (!order) return top;
		const byId = new Map(top.map((product) => [product.id, product]));
		return order.map((id) => byId.get(id)).filter((product) => product !== undefined);
	});

	// Rotates product exposure between visits. Runs on the client only so server HTML stays stable.
	onMount(() => {
		if (!shuffle) return;
		const ids = products.map((product) => product.id);
		for (let i = ids.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[ids[i], ids[j]] = [ids[j] as string, ids[i] as string];
		}
		order = ids;
	});

	const storeButton =
		"inline-flex items-center justify-center gap-2 no-underline hover:no-underline py-2.5 px-5 max-[480px]:py-2 max-[480px]:px-4 rounded text-[0.8rem] max-[480px]:text-xs font-semibold transition-all duration-75 cursor-pointer w-full text-center whitespace-nowrap hover:translate-y-0.5 active:translate-y-1 focus:outline focus:outline-blue-600 focus:outline-offset-2";

	function details(product: Product) {
		return product.technicalDetails.filter(
			(detail) => detail.value && detail.value.trim().toLowerCase() !== "não especificado",
		);
	}
</script>

{#if products.length === 0}
	<div class="my-2.5 rounded-lg bg-red-50 p-5 text-center text-red-600 dark:bg-black dark:text-red-400">
		Nenhum produto encontrado para a lista "{list}".
	</div>
{:else}
	<div class="my-2.5 flex flex-col gap-6" data-testid="cards-table">
		{#each products as product (product.id)}
			{@const slug = postSlug?.() ?? ""}
			{@const firstStore = storeLinks(product)[0]?.store}
			<!-- Every link goes through the links dashboard; a product without a store link uses the site offer. -->
			{@const priorityUrl = firstStore ? productHref(slug, product.id, firstStore) : fallbackHref}
			{@const technical = details(product)}
			<div
				class="grid grid-cols-6 items-stretch overflow-hidden rounded-xl border-2 bg-white text-black max-[768px]:grid-cols-1 dark:border-zinc-800 dark:bg-black dark:text-white"
			>
				<div class="col-span-3 flex flex-col items-center gap-3 p-6 text-center max-[768px]:col-span-1">
					<a
						href={priorityUrl}
						target="_blank"
						rel="noopener noreferrer sponsored"
						class="flex h-[160px] w-[160px] shrink-0 items-center justify-center p-2.5 no-underline hover:no-underline max-[480px]:h-[140px] max-[480px]:w-[140px]"
						title={product.name}
					>
						<!-- "#" marks a product still without a photo; as a src it would make the browser fetch the page again. -->
						{#if product.image !== "#"}
							<img
								src={product.image}
								alt={product.name}
								class="max-h-full max-w-full object-contain object-center"
								loading="lazy"
								decoding="async"
							/>
						{/if}
					</a>

					<a
						href={priorityUrl}
						target="_blank"
						rel="noopener noreferrer sponsored"
						class="line-clamp-3 max-w-100 text-[1rem] leading-snug font-bold wrap-break-word text-black uppercase no-underline transition-colors duration-75 hover:no-underline max-[480px]:text-[0.9rem] dark:text-white!"
						title={product.name}
					>
						{product.name}
					</a>

					<div class="flex w-full max-w-70 flex-col gap-2.5">
						{#if product.mercadolivreUrl}
							<a
								href={isAffiliateUrl(product.mercadolivreUrl)
									? productHref(slug, product.id, "mercadolivre")
									: fallbackHref}
								target="_blank"
								rel="noopener noreferrer sponsored"
								class="{storeButton} bg-[#fff159] text-black shadow-[0_4px_0_0_#ccb800] hover:bg-[#e6d84f] hover:text-black hover:shadow-[0_2px_0_0_#ccb800] active:shadow-[0_0px_0_0_#ccb800]"
								title="Ver preço no Mercado Livre"
							>
								<span class="flex shrink-0 items-center text-lg text-black max-[480px]:text-base">
									<Icon name="mercadopago" class="text-black" />
								</span>
								<span class="text-black">VER PREÇO MERCADOLIVRE</span>
							</a>
						{/if}

						{#if isAffiliateUrl(product.shopeeUrl)}
							<a
								href={productHref(slug, product.id, "shopee")}
								target="_blank"
								rel="noopener noreferrer sponsored"
								class="{storeButton} bg-[#ee4d2d] text-white shadow-[0_4px_0_0_#b83a20] hover:bg-[#d8431f] hover:shadow-[0_2px_0_0_#b83a20] active:shadow-[0_0px_0_0_#b83a20]"
								title="Ver preço na Shopee"
							>
								<span class="flex shrink-0 items-center text-lg text-white max-[480px]:text-base">
									<Icon name="shopee" class="text-white" />
								</span>
								<span class="text-white">VER PREÇO SHOPEE</span>
							</a>
						{/if}

						{#if isAffiliateUrl(product.amazonUrl)}
							<a
								href={productHref(slug, product.id, "amazon")}
								target="_blank"
								rel="noopener noreferrer sponsored"
								class="{storeButton} bg-[#232f3e] text-white shadow-[0_4px_0_0_#0f151c] hover:bg-[#374357] hover:shadow-[0_2px_0_0_#0f151c] active:shadow-[0_0px_0_0_#0f151c]"
								title="Ver preço na Amazon"
							>
								<span class="flex shrink-0 items-center text-lg text-[#ff9900] max-[480px]:text-base">
									<Icon name="amazon" class="text-[#ff9900]" />
								</span>
								<span class="text-white">VER PREÇO AMAZON</span>
							</a>
						{/if}
					</div>

					{#if product.advantages.length > 0}
						<div class="w-full overflow-hidden rounded-lg text-left">
							<div class="flex flex-col gap-1.5 px-3 py-2.5">
								<ul class="flex flex-col gap-1.5">
									{#each product.advantages.slice(0, MAX_ADVANTAGES) as advantage}
										<li
											class="flex items-start gap-2 text-lg leading-snug text-gray-800 dark:text-gray-300"
										>
											<Icon name="check" class="mt-1 shrink-0 text-base text-black dark:text-white" />
											<span>{advantage}</span>
										</li>
									{/each}
								</ul>
							</div>
						</div>
					{/if}
				</div>

				{#if technical.length > 0}
					<div class="col-span-3 flex items-center p-4 max-[768px]:col-span-1 max-[768px]:pt-0">
						<div class="w-full divide-y divide-gray-200 overflow-hidden rounded-lg dark:divide-zinc-800">
							{#each technical as detail}
								<!-- No fixed label width: a long label used to spill over its value. The label takes what it needs, up to half, and the value wraps in the rest. -->
								<div class="flex items-center justify-between gap-4 px-3 py-2.5">
									<span
										class="max-w-1/2 shrink-0 text-lg font-bold max-[480px]:text-base tracking-wide wrap-break-word text-black uppercase dark:text-white"
									>
										{detail.label}
									</span>
									<span
										class="min-w-0 flex-1 text-right text-lg wrap-break-word max-[480px]:text-base text-gray-800 dark:text-gray-300"
									>
										{detail.value}
									</span>
								</div>
							{/each}
						</div>
					</div>
				{/if}
			</div>
		{/each}
	</div>
{/if}
