import { getBlogPosts } from "@/lib/blog";
import ContatoClient from "./contato";

export const metadata = {
	title: "Entre em Contato - eletroradar",
	description: "Formulário de contato do site eletroradar",
	openGraph: {
		title: "Entre em Contato - eletroradar",
		description: "Formulário de contato do site eletroradar",
		url: "https://example.com/contato",
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
		title: "Entre em Contato - eletroradar",
		description: "Formulário de contato do site eletroradar",
		images: ["https://jn8ro29yhv.ufs.sh/f/vHeKy2kb0BOP11yB1f902oNUJAhsEHWQqlITjdxySgXvfmct"],
	},

	alternates: {
		canonical: "/contato",
	},
};

export default async function ContatoPage() {
	const blogPosts = await getBlogPosts("en");
	return <ContatoClient allPosts={blogPosts} />;
}
