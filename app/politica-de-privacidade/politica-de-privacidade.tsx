"use client";

import BlogPostHeader from "@/components/blog-post-header";
import Footer from "@/components/footer";
import { BlogPost } from "@/lib/blog";

export default function PoliticaDePrivacidadeClient({ allPosts }: { allPosts: BlogPost[] }) {
	return (
		<>
			<BlogPostHeader allPosts={allPosts} />

			<main className="max-w-3xl mx-auto px-4 py-12 text-black bg-background dark:text-white">
				<div className="">
					<h1 className="text-3xl font-bold mb-8 text-center text-black dark:text-white">
						Política de Privacidade E Cookies
					</h1>

					<div className=" p-6 rounded-lg mb-8">
						<p className="text-sm text-black dark:text-white mb-0">
							<strong>Última Atualização:</strong> 7 de Julho de 2026
						</p>
					</div>

					<div className="space-y-6">
						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-200">
								O Que Coletamos
							</h2>
							<div className="  p-4 rounded-lg">
								<p className="text-black dark:text-white mb-3">
									<strong>Não coletamos dados pessoais</strong> como nome, email, telefone ou
									endereço.
								</p>
								<p className="text-black dark:text-white mb-0">
									Coletamos apenas informações técnicas através de cookies para melhorar sua
									experiência no site, como:
								</p>
							</div>
							<ul className="mt-4 space-y-2 text-black dark:text-white">
								<li>• Sua localização aproximada (cidade/região)</li>
								<li>• Preferência de tema (claro ou escuro)</li>
								<li>• Horários em que você acessa o site</li>
								<li>• Frequência de visitas (diárias, semanais, mensais)</li>
								<li>• Tempo gasto lendo cada artigo</li>
								<li>• Páginas mais visitadas</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-200">
								Para Que Usamos
							</h2>
							<ul className="space-y-2 text-black dark:text-white">
								<li>• Personalizar o conteúdo para sua região</li>
								<li>• Lembrar suas preferências de tema</li>
								<li>• Entender quais produtos interessam mais</li>
								<li>• Melhorar a velocidade e funcionamento do site</li>
								<li>• Criar conteúdo mais relevante para nossos visitantes</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-200">Cookies</h2>
							<p className="text-black dark:text-white mb-4">
								Usamos cookies apenas para as funcionalidades mencionadas acima. Você pode:
							</p>
							<ul className="space-y-2 text-black dark:text-white">
								<li>• Desativar cookies nas configurações do seu navegador</li>
								<li>• Limpar cookies já armazenados</li>
								<li>• Continuar navegando normalmente (algumas funcionalidades podem ser limitadas)</li>
							</ul>
						</section>

						<section>
							<h2 className="text-xl font-semibold mb-4 text-black dark:text-gray-200">Segurança</h2>
							<p className="text-black dark:text-white">
								Todos os dados são armazenados no seu browser. Você pode limpar os cookies a qualquer
								momento.
							</p>
						</section>
					</div>
				</div>
			</main>

			<Footer />
		</>
	);
}
