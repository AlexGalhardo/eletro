"use client";

import BlogPostHeader from "@/components/blog-post-header";
import Footer from "@/components/footer";
import { BlogPost } from "@/lib/blog";

export default function TermosDeUsoPageComponent({ allPosts }: { allPosts: BlogPost[] }) {
	return (
		<>
			<BlogPostHeader allPosts={allPosts} />

			<main className="max-w-3xl mx-auto px-4 py-12 text-black bg-background dark:bg-black dark:text-white dark:border-transparent">
				<div>
					<h1 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">Termos de Uso</h1>

					<div className="p-6 rounded-lg mb-8">
						<p className="text-sm text-black dark:text-white mb-0">
							<strong>Última atualização:</strong> 7 de Julho de 2026
						</p>
					</div>

					<div className="space-y-6">
						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
								Aceitação dos Termos
							</h2>
							<div className="p-4 rounded-lg">
								<p className="text-black dark:text-white mb-3">
									<strong>Ao acessar e utilizar este site</strong>, você concorda automaticamente com
									estes termos de uso.
								</p>
							</div>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Uso do Conteúdo</h2>
							<ul className="space-y-2 text-black dark:text-white">
								<li>• Todo o conteúdo é fornecido apenas para fins educacionais e informativos</li>
								<li>• Não oferecemos aconselhamento financeiro personalizado</li>
								<li>• As informações não substituem a consulta com profissionais qualificados</li>
								<li>• Você é responsável por suas próprias decisões financeiras</li>
								<li>• O conteúdo pode ser compartilhado com a devida atribuição ao site</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-white">
								Propriedade Intelectual
							</h2>
							<p className="text-black dark:text-white mb-4">
								Não é permitido copiar, reproduzir ou distribuir o conteúdo deste site sem autorização
								prévia.
							</p>
							<ul className="space-y-2 text-black dark:text-white">
								<li>• Permitimos compartilhamento com atribuição adequada.</li>
								<li>• Não permitimos cópia integral sem autorização</li>
								<li>• Respeitamos os direitos de terceiros citados</li>
								<li>• Use o conteúdo de forma ética e legal</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Modificações</h2>
							<p className="text-black dark:text-white">
								Podemos atualizar estes termos a qualquer momento. A data da última atualização será
								sempre indicada no topo desta página. O uso continuado do site após as alterações
								constitui aceitação dos novos termos.
							</p>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-white">Contato</h2>
							<p className="text-black dark:text-white">
								Para dúvidas sobre estes termos de uso, entre em{" "}
								<a className="text-blue-500" href="/contato">
									contato através do do formulário disponível em nosso site
								</a>
							</p>
						</section>

						<section>
							<p className="text-black dark:text-white">
								Usamos links de afiliados. Ao comprar por eles, você apoia o site sem pagar nada a mais
								pelo produto ou serviço. Obrigado!
							</p>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</>
	);
}
