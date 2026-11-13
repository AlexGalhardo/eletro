/**
 * Single source of truth for the site identity.
 * To reuse this project as a template, edit this file and replace the files under `content/` and `static/`.
 */
export const site = {
	name: "EletroRadar",
	/** Shown in the header: the second part is highlighted. */
	logoText: ["Eletro", "Radar"],
	domain: "eletroradar.com.br",
	/** Production origin without trailing slash. Overridden by the PUBLIC_SITE_URL env var when set. */
	url: "https://eletroradar.com.br",
	githubRepo: "AlexGalhardo/eletro",
	locale: "pt-BR",
	title: "EletroRadar - Análises De Eletrodomésticos",
	description: "Análises e recomendações de eletrodomésticos que cabem no seu bolso.",
	longDescription:
		"Reviews, dicas e análises de produtos eletrodomésticos para sua casa que cabem no seu orçamento.",
	keywords: [
		"eletrodomésticos",
		"análise de eletrodomésticos",
		"dicas de eletrodomésticos",
		"recomendações de eletrodomésticos",
		"comprar eletrodomésticos",
		"melhores eletrodomésticos",
		"eletrodomésticos baratos",
		"eletrodomésticos de qualidade",
		"mercado livre",
	],
	logo: "/icon.svg",
	ogImage: "/logo.png",
	contactEmail: "contato@eletroradar.com.br",

	footer: {
		tagline: "O EletroRadar é um blog especializado em análises de eletrodomésticos.",
		about: "Nosso objetivo é orientar você na escolha do melhor produto, com base em análises e recomendações, ajudando você a encontrar o item ideal para suas necessidades e o seu orçamento.",
		affiliateDisclosure:
			"Ao comprar através dos links divulgados, ganhamos comissões de afiliado sem custo adicional para você.",
	},

	/** `icon` is a Lucide icon name resolved in CategoryIcon.astro. */
	categories: [
		{ id: "ferramentas", label: "Ferramentas", icon: "wrench" },
		{ id: "limpeza", label: "Limpeza", icon: "spray-can" },
		{ id: "climatizacao", label: "Climatização", icon: "wind" },
		{ id: "moveis", label: "Móveis", icon: "sofa" },
		{ id: "lavanderia", label: "Lavanderia", icon: "washing-machine" },
		{ id: "cozinha", label: "Cozinha", icon: "utensils-crossed" },
		{ id: "cuidados-pessoais", label: "Cuidados Pessoais", icon: "sparkles" },
		{ id: "banheiro", label: "Banheiro", icon: "bath" },
		{ id: "cama-mesa-banho", label: "Cama, Mesa e Banho", icon: "bed-double" },
		{ id: "iluminacao", label: "Iluminação", icon: "lightbulb" },
		{ id: "infantil", label: "Infantil", icon: "baby" },
		{ id: "jardim", label: "Jardim", icon: "sprout" },
	],

	authors: {
		bruno: {
			name: "Bruno Souza",
			role: "Redator",
			avatar: "/images/avatars/bruno-souza.jpg",
			color: "blue",
			bio: "Formado em Análise e Desenvolvimento de Sistemas, apaixonado por tecnologia, video game e cultura pop em geral. Co-criador do EletroRadar.com.br junto com sua irmã, gosta de pesquisar e escrever sobre software e produtos de tecnologia em geral.",
		},
		ana: {
			name: "Ana Souza",
			role: "Redatora",
			avatar: "/images/avatars/ana-souza.jpg",
			color: "pink",
			bio: "Formada em Publicidade e Propaganda, apaixonada por livros, filmes, séries e um bom café. Co-criadora do EletroRadar.com.br junto com seu irmão, freelancer de copywritting nas horas vagas, gosta de escrever sobre produtos domésticos em geral.",
		},
	},
	defaultAuthor: "bruno",

	/** Used when a product has no store link at all. */
	fallbackAffiliateUrl: "https://meli.la/1gvsK3J",

	/**
	 * Links dashboard that manages every affiliate link. Buttons point to its redirect and the build registers
	 * the links there (scripts/sync-links.ts, with the LINKS_DASHBOARD_TOKEN env var). See docs/affiliate-links.md.
	 */
	linksDashboardUrl: "https://links.lekzera.xyz",

	/**
	 * Post import by web scraping (`/admin/import`). The server only fetches https URLs whose host is
	 * listed here, matched exactly: pages from `sourceHosts`, product photos from `imageHosts`.
	 * The parser in `webscrapping/parse.ts` is written for the layout of the first source.
	 */
	postImport: {
		sourceHosts: ["eletrosinter.com.br", "www.eletrosinter.com.br"],
		imageHosts: [
			"eletrosinter.com.br",
			"www.eletrosinter.com.br",
			"m.media-amazon.com",
			"http2.mlstatic.com",
		],
		maxProducts: 7,
		/** Written in bold at the bottom right of the generated cover. */
		coverText: "EletroRadar.com.br",
	},

	/**
	 * Crawlers that collect pages in bulk or to train models: refused for the whole site in robots.txt.
	 * Search engines and assistants that open a page to answer someone, linking to it, stay allowed.
	 */
	blockedCrawlers: [
		"GPTBot",
		"ClaudeBot",
		"anthropic-ai",
		"CCBot",
		"Google-Extended",
		"Applebot-Extended",
		"Bytespider",
		"meta-externalagent",
		"Diffbot",
		"Omgilibot",
		"cohere-ai",
		"AI2Bot",
	],
	/** Shown in llms.txt and in the terms of use. */
	contentPolicy:
		"Assistentes de IA e buscadores podem ler as páginas para responder perguntas e recomendar o conteúdo, citando o site com link para a página. Não é permitido coletar o conteúdo de forma automatizada em massa (web scraping), republicá-lo ou usá-lo para treinar modelos.",

	analytics: {
		googleAnalyticsId: "G-YM6VCZJPJV",
		clarityId: "xksnzl3r9x",
		googleSiteVerification: "XQtFLXisc2sfS7uKnxE-3jB1NRTwFZlbbQNL75zn0Zg",
	},
} as const;

export type AuthorId = keyof typeof site.authors;
export type Author = (typeof site.authors)[AuthorId];
export type Category = (typeof site.categories)[number];
