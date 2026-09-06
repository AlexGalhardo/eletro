import { getBlogPosts } from "@/lib/blog";
import SobreClient from "./sobre";

export const metadata = {
	title: "Sobre eletroradar",
	description: "Confira o Sobre do eletroradar",
	openGraph: {
		title: "Sobre - eletroradar",
		description: "Confira a Página Sobre do eletroradar",
		url: "https://example.com/sobre",
		siteName: "eletroradar",
		images: [
			{
				url: "https://example.com/logo.webp",
				width: 1200,
				height: 630,
				alt: "eletroradar",
			},
		],
		locale: "pt_BR",
		type: "website",
	},
	twitter: {
		card: "summary_large_image",
		title: "Sobre - eletroradar",
		description: "Confira a Página Sobre do eletroradar",
		images: ["https://example.com/logo.webp"],
	},

	alternates: {
		canonical: "/sobre",
	},
};

export default async function PTAboutPage() {
	const blogPosts = await getBlogPosts("en");
	return <SobreClient allPosts={blogPosts} />;
}
