import { getBlogPosts } from "@/lib/blog";
import PTTermsOfUseClient from "./termos-de-uso";

export const metadata = {
	title: "Termos de Uso - eletroradar",
	description: "Confira os Termos de Uso do eletroradar",
	openGraph: {
		title: "Termos de Uso - eletroradar",
		description: "Confira os Termos de Uso do eletroradar",
		url: "https://example.com/termos-de-uso",
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
		title: "Termos de Uso - eletroradar",
		description: "Confira os Termos de Uso do eletroradar",
		images: ["https://example.com/logo.webp"],
	},

	alternates: {
		canonical: "/termos-de-uso",
	},
};

export default async function PTTermsOfUsePage() {
	const blogPosts = await getBlogPosts("en");
	return <PTTermsOfUseClient allPosts={blogPosts} />;
}
