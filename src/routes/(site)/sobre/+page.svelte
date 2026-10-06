<script lang="ts">
	import AuthorCard from "#lib/components/AuthorCard.svelte";
	import Seo from "#lib/components/Seo.svelte";
	import { site } from "#lib/site.config.ts";

	const authorIds = Object.keys(site.authors);
</script>

<Seo title="Sobre {site.name}.com.br" description="Confira o Sobre do {site.name}.com.br" path="/sobre" />

<main
	class="bg-background mx-auto max-w-3xl px-4 py-12 text-white dark:border-gray-300 dark:bg-black dark:text-white"
>
	<div>
		<h1 class="mb-8 text-center text-4xl font-bold text-black dark:text-white">Sobre</h1>

		<div class="space-y-10">
			<section>
				<p class="text-black dark:text-white">
					<strong>{site.name}.com.br</strong> é um portal editorial independente dedicado à produção de
					conteúdo informativo sobre produtos eletrodomésticos em geral, como produtos físicos, eletrônicos,
					gadgets, acessórios e muito mais.
					<br />
					<br />
					Nosso objetivo é ajudar o consumidor a compreender melhor os produtos que deseja adquirir, fornecendo
					informações detalhadas, análises comparativas e dicas práticas para facilitar a tomada de decisão.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold text-black dark:text-white">Propósito e Compromisso</h2>
				<p class="text-black dark:text-white">
					O propósito do <strong>{site.name}.com.br</strong> é fornecer informações confiáveis e imparciais
					sobre produtos eletrodomésticos, ajudando os consumidores a fazer escolhas mais informadas e
					conscientes.
					<br />
					<br />
					Buscamos sempre agregar valor real à vida das pessoas por meio de conteúdos educativos, comparativos,
					práticos e bem estruturados, focados em ajudar o consumidor a fazer escolhas mais inteligentes.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold text-black dark:text-white">Política Editorial</h2>
				<p class="text-black dark:text-white">
					Todo o conteúdo publicado no <strong>{site.name}.com.br</strong> é produzido seguindo critérios
					editoriais próprios, com foco em clareza, responsabilidade e transparência. Utilizamos fontes públicas
					e confiáveis, testes práticos, análises comparativas e dados técnicos fornecidos por fabricantes,
					fontes oficiais e especialistas do setor.
					<br />
					<br />
					Nossa expectativa é publicar novas postagens toda semana.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold text-black dark:text-white">Responsabilidade</h2>
				<p class="text-black dark:text-white">
					Os conteúdos têm carater informativo e educacional e não substituem a orientação de profissionais
					especializados, como técnicos, engenheiros, eletricistas ou assistências autorizadas.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold text-black dark:text-white">Links de Afiliados</h2>
				<p class="text-black dark:text-white">
					Utilizamos links de afiliados em alguns conteúdos, o que significa que podemos receber uma comissão
					caso você realize uma compra por meio desses links. Isso não afeta o preço do produto para você e
					nos ajuda a manter o site ativo e a produzir mais conteúdo de qualidade.
				</p>
			</section>

			<section>
				<h2 class="mb-3 text-xl font-semibold text-black dark:text-white">Redatores</h2>
				<div class="space-y-6">
					{#each authorIds as id (id)}
						<AuthorCard {id} />
					{/each}
				</div>
			</section>
		</div>
	</div>
</main>
