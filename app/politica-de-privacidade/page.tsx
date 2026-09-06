import { getBlogPosts } from "@/lib/blog";
import PoliticaDePrivacidadeClient from "./politica-de-privacidade";

export const metadata = {
	title: "Política de Privacidade - eletroradar",
	description: "Termos de Uso e Política de Privacidade e Cookies do site eletroradar",
	openGraph: {
		title: "Politica de Privacidade - eletroradar",
		description: "Termos de Uso e Política de Privacidade e Cookies do site eletroradar",
		url: "https://example.com/politica-de-privacidade",
		siteName: "eletroradar",
		images: [
			{
				url: "/logo.webp",
				width: 1200,
				height: 630,
				alt: "eletroradar",
			},
		],
		locale: "en_US",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Politica de Privacidade - eletroradar",
		description: "Termos de Uso e Política de Privacidade e Cookies do site eletroradar",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},

	alternates: {
		canonical: "/politica-de-privacidade",
	},
};

export default async function PoliticaDePrivacidadePage() {
	const blogPosts = await getBlogPosts("en");
	return <PoliticaDePrivacidadeClient allPosts={blogPosts} />;
}
