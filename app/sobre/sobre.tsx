"use client";

import BlogPostHeader from "@/components/blog-post-header";
import Footer from "@/components/footer";
import { BlogPost } from "@/lib/blog";
import Image from "next/image";

export default function SobreClient({ allPosts }: { allPosts: BlogPost[] }) {
	return (
		<>
			<BlogPostHeader allPosts={allPosts} />

			<main className="max-w-3xl mx-auto px-4 py-12 text-white bg-background dark:bg-black dark:text-white dark:border-gray-300">
				<div>
					<h1 className="text-4xl font-bold mb-8 text-center text-black dark:text-white">Sobre</h1>

					<div className="space-y-10">
						<section>
							<p className="text-black dark:text-white">
								<strong>eletroradar</strong> é um portal editorial independente dedicado à
								produção de conteúdo informativo sobre produtos eletrodomésticos em geral, como produtos
								físicos, eletrônicos, gadgets, acessórios e muito mais.
								<br />
								<br />
								Nosso objetivo é ajudar o consumidor a compreender melhor os produtos que deseja
								adquirir, fornecendo informações detalhadas, análises comparativas e dicas práticas para
								facilitar a tomada de decisão.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-black dark:text-white mb-3">
								Propósito e Compromisso
							</h2>
							<p className="text-black dark:text-white">
								O propósito do <strong>eletroradar</strong> é fornecer informações confiáveis e
								imparciais sobre produtos eletrodomésticos, ajudando os consumidores a fazer escolhas
								mais informadas e conscientes.
								<br />
								<br />
								Buscamos sempre agregar valor real à vida das pessoas por meio de conteúdos educativos,
								comparativos, práticos e bem estruturados, focados em ajudar o consumidor a fazer
								escolhas mais inteligentes.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-black dark:text-white mb-3">
								Política Editorial
							</h2>
							<p className="text-black dark:text-white">
								Todo o conteúdo publicado no <strong>eletroradar</strong> é produzido seguindo
								critérios editoriais próprios, com foco em clareza, responsabilidade e transparência.
								Utilizamos fontes públicas e confiáveis, testes práticos, análises comparativas e dados
								técnicos fornecidos por fabricantes, fontes oficiais e especialistas do setor.
								<br />
								<br />
								Nossa expectativa é publicar novas postagens toda semana.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-black dark:text-white mb-3">Responsabilidade</h2>
							<p className="text-black dark:text-white">
								Os conteúdos têm carater informativo e educacional e não substituem a orientação de
								profissionais especializados, como técnicos, engenheiros, eletricistas ou assistências
								autorizadas.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-black dark:text-white mb-3">
								Links de Afiliados
							</h2>
							<p className="text-black dark:text-white">
								Utilizamos links de afiliados em alguns conteúdos, o que significa que podemos receber
								uma comissão caso você realize uma compra por meio desses links. Isso não afeta o preço
								do produto para você e nos ajuda a manter o site ativo e a produzir mais conteúdo de
								qualidade.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold text-black dark:text-white mb-3">Redatores</h2>
							<div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 p-4 mb-6">
								<Image
									src="/images/avatars/bruno-souza.jpg"
									alt="Bruno Souza"
									width={56}
									height={56}
									className="w-14 h-14 rounded-full object-cover border-2 border-blue-400 dark:border-blue-600 flex-shrink-0"
								/>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-gray-900 dark:text-white normal-case">
											Bruno Souza
										</span>
										<span className="text-xs font-medium text-blue-600 dark:text-blue-400 normal-case">
											Redator
										</span>
									</div>
									<p className="text-sm text-gray-600 dark:text-gray-300 normal-case leading-relaxed mt-1">
										Formado em Análise e Desenvolvimento de Sistemas, apaixonado por tecnologia,
										video game e cultura pop em geral. Co-criador do eletroradar junto com
										sua irmã, gosta de pesquisar e escrever sobre software e produtos de tecnologia
										em geral.
									</p>
								</div>
							</div>

							<div className="flex items-center gap-4 rounded-xl border border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/40 p-4">
								<Image
									src="/images/avatars/ana-souza.jpg"
									alt="Ana Souza"
									width={56}
									height={56}
									className="w-14 h-14 rounded-full object-cover border-2 border-pink-400 dark:border-pink-600 flex-shrink-0"
								/>
								<div>
									<div className="flex items-center gap-2">
										<span className="font-semibold text-gray-900 dark:text-white normal-case">
											Ana Souza
										</span>
										<span className="text-xs font-medium text-pink-600 dark:text-pink-400 normal-case">
											Redatora
										</span>
									</div>
									<p className="text-sm text-gray-600 dark:text-gray-300 normal-case leading-relaxed mt-1">
										Formada em Publicidade e Propaganda, apaixonada por livros, filmes, séries e um
										bom café. Co-criadora do eletroradar junto com seu irmão, freelancer de
										copywritting nas horas vagas, gosta de escrever sobre produtos domésticos em
										geral.
									</p>
								</div>
							</div>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</>
	);
}
