import { Inter } from "next/font/google";
import type { Metadata } from "next";
import type React from "react";
import "./globals.css";
import TopLoadingBar from "@/components/TopLoadingBar";
import GoogleAnalytics from "../components/GoogleAnalytics";
import { Providers } from "./providers";
import { russoOne } from "@/lib/fonts";
import { Analytics } from "@vercel/analytics/next";
import Script from "next/script";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
	metadataBase: new URL("https://example.com"),
	title: "EletroRadar - Análises De Eletrodomésticos",
	verification: {
		google: "XQtFLXisc2sfS7uKnxE-3jB1NRTwFZlbbQNL75zn0Zg",
	},
	description: "Análises e recomendações de eletrodomésticos que cabem no seu bolso.",
	keywords: [
		"eletrodomésticos",
		"análise de eletrodomésticos",
		"dicas de eletrodomésticos",
		"recomendações de eletrodomésticos",
		"comprar eletrodomésticos",
		"melhores eletrodomésticos",
		"eletrodomésticos baratos",
		"eletrodomésticos de qualidade",
		"eletrodomésticos confiáveis",
		"eletrodomésticos duráveis",
		"eletrodomésticos eficientes",
		"eletrodomésticos econômicos",
		"eletrodomésticos modernos",
		"eletrodomésticos inovadores",
		"eletrodomésticos inteligentes",
		"eletrodomésticos sustentáveis",
		"mercado livre",
	],
	authors: [{ name: "eletroradar" }],
	icons: {
		icon: "/logo.png",
	},
	openGraph: {
		title: "EletroRadar - Análises De Eletrodomésticos",
		description: "Análises e recomendações de eletrodomésticos que cabem no seu bolso.",
		url: "https://example.com",
		siteName: "eletroradar",
		images: [
			{
				url: "/logo.webp",
				width: 1200,
				height: 630,
				alt: "eletroradar -  Análises De Eletrodomésticos",
			},
		],
		locale: "pt-BR",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "EletroRadar - Análises De Eletrodomésticos",
		description: "Análises e recomendações de eletrodomésticos que cabem no seu bolso.",
		images: ["/new-logo.webp"],
	},
	alternates: {
		canonical: "https://example.com",
		languages: {
			"pt-BR": "https://example.com",
		},
	},
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
	return (
		<html lang="pt-BR" className={russoOne.variable} suppressHydrationWarning>
			<body className={`${inter.className} text-white dark:bg-black dark:text-white`}>
				<TopLoadingBar />
				<GoogleAnalytics GA_MEASUREMENT_ID="G-YM6VCZJPJV" />
				<Providers>{children}</Providers>

				<Analytics />

				<Script
					id="ms-clarity"
					strategy="afterInteractive"
					dangerouslySetInnerHTML={{
						__html: `
							(function(c,l,a,r,i,t,y){
								c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
								t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
								y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
							})(window, document, "clarity", "script", "xksnzl3r9x");
						`,
					}}
				/>
			</body>
		</html>
	);
}
