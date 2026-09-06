"use client";

import Link from "next/link";

export default function Footer() {
	const currentYear = new Date().getFullYear();

	return (
		<footer className=" mt-6 bg-gray-200 dark:bg-black dark:border-white  py-8">
			<div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col gap-6">
				<nav className=" dark:border-white mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center sm:justify-between gap-3 sm:gap-4 pb-6 border-gray-200 text-base sm:text-sm font-bold uppercase">
					<Link
						href="/sobre"
						className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
					>
						Sobre
					</Link>
					<span className="hidden sm:hidden text-gray-400 dark:text-white">•</span>
					<Link
						href="/contato"
						className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
					>
						Contato
					</Link>
					<span className="hidden sm:hidden text-gray-400 dark:text-white">•</span>
					<Link
						href="/termos-de-uso"
						className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
					>
						Termos de Uso
					</Link>
					<span className="hidden sm:hidden text-gray-400 dark:text-white">•</span>
					<Link
						href="/politica-de-privacidade"
						className="text-blue-600 dark:text-blue-500 hover:text-blue-700 dark:hover:text-blue-400 transition-colors"
					>
						Política de Privacidade
					</Link>
				</nav>

				<div className="flex flex-col gap-4 pb-6 border-gray-200 dark:border-zinc-800 text-sm text-black dark:text-white leading-relaxed">
					<p>
						<span className="font-bold text-black dark:text-white">
							O EletroRadar é um blog especializado em análises de eletrodomésticos.
						</span>{" "}
						Nosso objetivo é orientar você na escolha do melhor produto, com base em análises e
						recomendações, ajudando você a encontrar o item ideal para suas necessidades e o seu orçamento.
					</p>

					<p>
						Ao comprar através dos links divulgados, ganhamos comissões de afiliado sem custo adicional para
						você.
					</p>
				</div>

				<p className="text-center text-sm font-bold uppercase text-black dark:text-white">
					© {currentYear} eletroradar
				</p>
			</div>
		</footer>
	);
}
