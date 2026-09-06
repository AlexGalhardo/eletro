import { getBlogPosts } from "@/lib/blog";
import ClientLandingPage from "./ClientLandingPage";
import LandingSchemaMarkup from "@/components/landing-markup-schema";

export interface BlogPostInterface {
	id?: number;
	title: string;
	description: string;
	cover: string;
	date: string;
	slug: string;
	category: string;
	content: string;
}

export const blogPostCategories = [
	{ id: "all", name: "Todos" },
	{ id: "learning", name: "Saiba Mais" },
	{ id: "ia", name: "I.A" },
	{ id: "smartphones", name: "Celulares" },
	{ id: "computers", name: "Computadores" },
	{ id: "accessories", name: "Acessórios" },
	{ id: "gadgets", name: "Periféricos" },
	{ id: "sala", name: "Sala" },
	{ id: "cozinha", name: "Cozinha" },
	{ id: "banheiro", name: "Banheiro" },
	{ id: "quintal", name: "Quintal" },
	{ id: "quarto", name: "Quarto" },
	{ id: "ofertas", name: "Patrocinados" },
];

export default async function LandingPage() {
	const blogPosts = await getBlogPosts("en");

	const featuredPosts = blogPosts.slice(0, 10);

	return (
		<>
			<LandingSchemaMarkup
				totalPosts={blogPosts.length}
				categories={blogPostCategories}
				featuredPosts={featuredPosts}
			/>

			<ClientLandingPage blogPosts={blogPosts} allPosts={blogPosts} />
		</>
	);
}
