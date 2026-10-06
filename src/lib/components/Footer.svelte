<script lang="ts">
	import { site } from "#lib/site.config.ts";

	const year = new Date().getFullYear();

	const institutional = [
		{ href: "/sobre", label: "Sobre" },
		{ href: "/contato", label: "Contato" },
	];
	const legal = [
		{ href: "/termos-de-uso", label: "Termos de Uso" },
		{ href: "/politica-de-privacidade", label: "Política de Privacidade" },
	];

	const heading = "text-xs font-bold tracking-wider text-gray-500 uppercase dark:text-gray-400";
	const link =
		"text-sm font-semibold text-gray-800 transition-colors hover:text-blue-600 dark:text-gray-200 dark:hover:text-blue-400";
</script>

<footer class="mt-6 border-t border-gray-200 bg-gray-100 dark:border-zinc-800 dark:bg-black">
	<div class="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
		<div class="grid grid-cols-2 gap-x-8 gap-y-10 py-12 md:grid-cols-12">
			<div class="col-span-2 md:col-span-5">
				<a href="/" class="inline-flex items-center gap-2 transition-opacity hover:opacity-80">
					<img src={site.logo} alt="" width="36" height="36" loading="lazy" />
					<span class="font-russo-one text-lg leading-none text-black uppercase dark:text-white">
						{site.logoText[0]}<span class="text-green-600 dark:text-green-500">{` ${site.logoText[1]}`}</span>
					</span>
				</a>
				<p class="mt-4 max-w-md text-sm! leading-relaxed text-gray-700 dark:text-gray-300">
					<span class="font-bold text-black dark:text-white">{site.footer.tagline}</span>
					{site.footer.about}
				</p>
			</div>

			<nav class="md:col-span-3" aria-label="Categorias">
				<h2 class={heading}>Categorias</h2>
				<ul class="mt-4 space-y-2.5">
					{#each site.categories as category (category.id)}
						<li class="text-sm!"><a href="/?categoria={category.id}" class={link}>{category.label}</a></li>
					{/each}
				</ul>
			</nav>

			<nav class="md:col-span-2" aria-label="Institucional">
				<h2 class={heading}>Institucional</h2>
				<ul class="mt-4 space-y-2.5">
					{#each institutional as item (item.href)}
						<li class="text-sm!"><a href={item.href} class={link}>{item.label}</a></li>
					{/each}
				</ul>
			</nav>

			<nav class="md:col-span-2" aria-label="Legal">
				<h2 class={heading}>Legal</h2>
				<ul class="mt-4 space-y-2.5">
					{#each legal as item (item.href)}
						<li class="text-sm!"><a href={item.href} class={link}>{item.label}</a></li>
					{/each}
				</ul>
			</nav>
		</div>

		<div class="border-t border-gray-200 py-6 dark:border-zinc-800">
			<p class="text-xs! leading-relaxed text-gray-600 dark:text-gray-400">
				<span class="font-semibold text-gray-800 dark:text-gray-200">Aviso de afiliados:</span>
				{site.footer.affiliateDisclosure}
			</p>
		</div>

		<div
			class="flex flex-col items-center justify-between gap-2 border-t border-gray-200 py-6 sm:flex-row dark:border-zinc-800"
		>
			<p class="text-xs! font-semibold text-gray-700 uppercase dark:text-gray-300">
				© {year}
				{site.domain}
			</p>
			<p class="text-xs! text-gray-500 dark:text-gray-400">Todos os direitos reservados.</p>
		</div>
	</div>
</footer>
