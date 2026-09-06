import { notFound } from "next/navigation";
import { Share2, Clock, Calendar } from "lucide-react";
import { MDXRemote } from "next-mdx-remote/rsc";
import { getAllPostSlugs, getBlogPost, getBlogPosts } from "@/lib/blog";
import { Metadata } from "next";
import Image from "next/image";
import ClientBlogPost from "./ClientBlogPost";
import { FaXTwitter, FaFacebookF, FaWhatsapp, FaTelegram, FaLinkedinIn, FaPinterest, FaReddit } from "react-icons/fa6";
import BlogPostHeader from "@/components/blog-post-header";
import CopyButton from "@/components/copy-button";
import SchemaMarkup from "@/components/schema-markup";
import CopyProtection from "@/app/[slug]/CopyProtection";
import Footer from "@/components/footer";
import { CardsTable } from "@/components/CardsTable";

export async function generateStaticParams() {
	const slugs = await getAllPostSlugs();

	return slugs.map((slug) => ({
		slug: slug,
	}));
}

export const revalidate = 3600;

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
	const { slug } = await params;
	const post = await getBlogPost(slug, "en");

	if (!post) {
		return {
			title: "Post não encontrado",
			description: "Este post não existe.",
		};
	}

	return {
		title: post.title,
		description: post.description,
		openGraph: {
			title: post.title,
			description: post.description,
			type: "article",
			publishedTime: post.date,
			images: post.cover ? [post.cover] : [],
		},
		twitter: {
			card: "summary_large_image",
			title: post.title,
			description: post.description,
			images: post.cover ? [post.cover] : [],
		},
	};
}

interface BlogPostPageProps {
	params: Promise<{
		slug: string;
	}>;
}

function ShareButtons({ url, title }: { url: string; title: string }) {
	const encodedUrl = encodeURIComponent(url);
	const encodedTitle = encodeURIComponent(title);

	const shareLinks = [
		{
			name: "Twitter",
			url: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
			color: "bg-black hover:bg-gray-800 dark:bg-white dark:text-black dark:hover:bg-gray-200",
			icon: <FaXTwitter />,
		},
		{
			name: "Facebook",
			url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
			color: "bg-blue-600 hover:bg-blue-700",
			icon: <FaFacebookF />,
		},
		{
			name: "WhatsApp",
			url: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}`,
			color: "bg-green-500 hover:bg-green-600",
			icon: <FaWhatsapp />,
		},
		{
			name: "Telegram",
			url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
			color: "bg-blue-400 hover:bg-blue-500",
			icon: <FaTelegram />,
		},
		{
			name: "LinkedIn",
			url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
			color: "bg-blue-700 hover:bg-blue-800",
			icon: <FaLinkedinIn />,
		},
		{
			name: "Reddit",
			url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
			color: "bg-orange-500 hover:bg-orange-600",
			icon: <FaReddit />,
		},
		{
			name: "Pinterest",
			url: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
			color: "bg-red-600 hover:bg-red-700",
			icon: <FaPinterest />,
		},
	];

	return (
		<div className="flex flex-nowrap items-center gap-1.5 sm:gap-2 overflow-x-auto">
			{shareLinks.map((link) => (
				<a
					key={link.name}
					href={link.url}
					target="_blank"
					rel="noopener noreferrer"
					className={`${link.color} text-white w-6 h-6 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-[10px] sm:text-sm transition-all duration-200 hover:scale-110 shrink-0`}
					title={`Compartilhar no ${link.name}`}
					aria-label={`Compartilhar no ${link.name}`}
				>
					{link.icon}
				</a>
			))}

			<CopyButton url={url} />
		</div>
	);
}

const components = {
	CardsTable,
};

export default async function BlogPostPage({ params }: BlogPostPageProps) {
	const { slug } = await params;
	const post = await getBlogPost(slug, "en");

	if (!post) {
		notFound();
	}

	const allPosts = await getBlogPosts("en");

	const shareUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://example.com"}/${post.slug}`;

	return (
		<>
			<SchemaMarkup post={post} shareUrl={shareUrl} />

			<ClientBlogPost />

			<BlogPostHeader allPosts={allPosts} />

			<div className="min-h-screen  dark:bg-black">
				<div className="max-w-3xl mx-auto">
					<div className="flex justify-center">
						<main className="w-full max-w-5xl mt-6">
							<article className="bg-white dark:bg-black p-6">
								<header className="mb-8">
									<h1 className="text-3xl sm:text-2xl md:text-3xl font-bold mb-4 text-gray-900 dark:text-white leading-tight">
										{post.title}
									</h1>

									{post.description && (
										<p className="text-lg sm:text-xl text-gray-600 dark:text-white mb-6 leading-relaxed">
											{post.description}
										</p>
									)}

									<div className="flex flex-wrap items-center justify-between gap-3 text-sm text-gray-600 dark:text-white pb-6 uppercase">
										<time dateTime={post.date} className="flex items-center gap-1.5">
											<Calendar className="w-4 h-4" />
											<span>
												POSTADO EM{" "}
												{new Date(`${post.date}T00:00:00`).toLocaleDateString("pt-BR", {
													day: "numeric",
													month: "long",
													year: "numeric",
												})}
											</span>
										</time>

										<span className="flex items-center gap-1.5">
											<Clock className="w-4 h-4" />
											<span>
												{post.readingTime.replace(
													" min read",
													` ${Number.parseInt(post.readingTime) > 1 ? "minutos de leitura" : "minuto de leitura"}`,
												)}
											</span>
										</span>
									</div>
								</header>

								<div className="mb-8">
									<div className="flex items-center gap-2 mb-4">
										<Share2 className="w-5 h-5 text-gray-700 dark:text-white shrink-0" />
										<span className="text-sm sm:text-xm font-medium text-gray-700 dark:text-white">
											COMPARTILHE COM MAIS PESSOAS:
										</span>
									</div>
									<ShareButtons url={shareUrl} title={post.title} />
								</div>

								{post.cover && (
									<div className="relative w-full aspect-video overflow-hidden bg-gray-100 dark:bg-black mb-8">
										<Image
											src={post.cover}
											alt={post.title}
											fill
											className="object-cover"
											priority
											quality={90}
											sizes="(max-width: 1024px) 100vw, 1024px"
										/>
									</div>
								)}

								<div
									id="blog-content-protected"
									className="mb-8 prose prose-lg max-w-none 
										prose-headings:text-gray-900 dark:prose-headings:text-white
										prose-headings:font-bold
										prose-p:text-gray-700 dark:prose-p:text-gray-300
										prose-p:leading-relaxed
										prose-strong:text-gray-900 dark:prose-strong:text-white
										prose-strong:font-semibold
										prose-a:text-blue-600 dark:prose-a:text-blue-400 
										prose-a:no-underline hover:prose-a:underline
										prose-blockquote:border-l-blue-500 dark:prose-blockquote:border-l-blue-400
										prose-blockquote:text-gray-700 dark:prose-blockquote:text-gray-300
										prose-blockquote: dark:prose-blockquote:bg-black
										prose-blockquote:py-2 prose-blockquote:px-4 prose-blockquote:rounded-r
										prose-code:text-gray-900 dark:prose-code:text-gray-100
										prose-code:bg-gray-100 dark:prose-code:bg-black
										prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded
										prose-pre:bg-gray-900 dark:prose-pre:bg-black
										prose-pre:border prose-pre:border-gray-200 dark:prose-pre:border-zinc-700
										prose-ol:text-gray-700 dark:prose-ol:text-gray-300
										prose-ul:text-gray-700 dark:prose-ul:text-gray-300
										prose-li:text-gray-700 dark:prose-li:text-gray-300
										prose-li:marker:text-gray-500 dark:prose-li:marker:text-gray-400
										prose-table:text-gray-700 dark:prose-table:text-gray-300
										prose-th:text-gray-900 dark:prose-th:text-white
										prose-th:bg-gray-100 dark:prose-th:bg-black
										prose-td:text-gray-700 dark:prose-td:text-gray-300
										prose-img:rounded-xl prose-img:shadow-lg
										prose-hr:border-gray-300 dark:prose-hr:border-zinc-700
										select-none"
								>
									<MDXRemote source={post.content} components={components} />
								</div>

								{post.author === "bruno" && (
									<div className="flex items-center gap-4 rounded-xl border border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950/40 p-4">
										<Image
											src="/images/avatars/bruno-souza.jpg"
											alt="Bruno Souza"
											width={56}
											height={56}
											className="w-14 h-14 rounded-full object-cover border-2 border-blue-400 dark:border-blue-600 flex-shrink-0"
										/>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-semibold text-gray-900 dark:text-white normal-case">
													Bruno Souza
												</span>
												<span className="text-xs font-medium text-blue-600 dark:text-blue-400 normal-case">
													Redator
												</span>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-300 normal-case leading-relaxed mt-1">
												Formado em Análise e Desenvolvimento de Sistemas, apaixonado por
												tecnologia, video game e cultura pop em geral. Co-criador do
												eletroradar junto com sua irmã, gosta de pesquisar e escrever
												sobre software e produtos de tecnologia em geral.
											</p>
										</div>
									</div>
								)}

								{post.author === "ana" && (
									<div className="flex items-center gap-4 rounded-xl border border-pink-200 bg-pink-50 dark:border-pink-900 dark:bg-pink-950/40 p-4">
										<Image
											src="/images/avatars/ana-souza.jpg"
											alt="Ana Souza"
											width={56}
											height={56}
											className="w-14 h-14 rounded-full object-cover border-2 border-pink-400 dark:border-pink-600 flex-shrink-0"
										/>
										<div>
											<div className="flex items-center gap-2">
												<span className="font-semibold text-gray-900 dark:text-white normal-case">
													Ana Souza
												</span>
												<span className="text-xs font-medium text-pink-600 dark:text-pink-400 normal-case">
													Redatora
												</span>
											</div>
											<p className="text-sm text-gray-600 dark:text-gray-300 normal-case leading-relaxed mt-1">
												Formada em Publicidade e Propaganda, apaixonada por livros, filmes,
												séries e um bom café. Co-criadora do eletroradar junto com seu
												irmão, freelancer de copywritting nas horas vagas, gosta de escrever
												sobre produtos domésticos em geral.
											</p>
										</div>
									</div>
								)}

								<div className="mt-6 pt-6 border-gray-200 dark:border-zinc-800">
									<div className="flex items-center gap-2 mb-4">
										<Share2 className="w-5 h-5 text-gray-700 dark:text-white shrink-0" />
										<span className="text-sm font-medium text-gray-700 dark:text-white">
											COMPARTILHE COM MAIS PESSOAS:
										</span>
									</div>
									<ShareButtons url={shareUrl} title={post.title} />
								</div>
							</article>
						</main>
					</div>
				</div>
			</div>

			<CopyProtection />

			<Footer />
		</>
	);
}
