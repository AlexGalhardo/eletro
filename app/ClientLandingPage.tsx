"use client";

import Footer from "@/components/footer";
import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BlogPost } from "@/lib/blog";
import BlogPostHeader from "@/components/blog-post-header";
import { Layers, Wrench, SprayCan, Wind, Sofa, WashingMachine, UtensilsCrossed, Clock } from "lucide-react";
import CookieBanner from "@/components/CookieBanner";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ClientLandingPageProps {
	blogPosts: BlogPost[];
	allPosts: BlogPost[];
}

const CATEGORIES = [
	{ id: "all", label: "Todos", icon: Layers },
	{ id: "ferramentas", label: "Ferramentas", icon: Wrench },
	{ id: "limpeza", label: "Limpeza", icon: SprayCan },
	{ id: "climatizacao", label: "Climatização", icon: Wind },
	{ id: "moveis", label: "Móveis", icon: Sofa },
	{ id: "lavanderia", label: "Lavanderia", icon: WashingMachine },
	{ id: "cozinha", label: "Cozinha", icon: UtensilsCrossed },
];

function relativeDate(dateStr: string) {
	try {
		const date = new Date(`${dateStr}T00:00:00`);
		return format(date, "d 'de' MMMM 'de' yyyy", { locale: ptBR });
	} catch {
		return "";
	}
}

export default function ClientLandingPage({ blogPosts, allPosts }: ClientLandingPageProps) {
	const loadingRef = useRef<HTMLDivElement>(null);

	const [displayedPosts, setDisplayedPosts] = useState<BlogPost[]>([]);
	const [hasMore, setHasMore] = useState(true);
	const [isLoading, setIsLoading] = useState(false);
	const [selectedCategory, setSelectedCategory] = useState("all");

	const postsPerLoad = 8;

	const filteredPosts = useMemo(() => {
		return blogPosts.filter((post: BlogPost) => {
			const matchesCategory = selectedCategory === "all" || post.category === selectedCategory;
			return matchesCategory;
		});
	}, [blogPosts, selectedCategory]);

	const loadMorePosts = useCallback(() => {
		if (isLoading || !hasMore) return;

		setIsLoading(true);

		setTimeout(() => {
			setDisplayedPosts((prev) => {
				const startIndex = prev.length;
				const endIndex = startIndex + postsPerLoad;
				const newPosts = filteredPosts.slice(startIndex, endIndex);

				if (newPosts.length === 0) {
					setHasMore(false);
					setIsLoading(false);
					return prev;
				}

				if (endIndex >= filteredPosts.length) {
					setHasMore(false);
				}

				setIsLoading(false);
				return [...prev, ...newPosts];
			});
		}, 300);
	}, [isLoading, hasMore, filteredPosts, postsPerLoad]);

	useEffect(() => {
		setDisplayedPosts([]);
		setHasMore(true);
		setIsLoading(false);

		const initialPosts = filteredPosts.slice(0, postsPerLoad);
		setDisplayedPosts(initialPosts);

		if (initialPosts.length < postsPerLoad || filteredPosts.length <= postsPerLoad) {
			setHasMore(false);
		}
	}, [filteredPosts, postsPerLoad]);

	useEffect(() => {
		if (!loadingRef.current) return;

		const observer = new IntersectionObserver(
			(entries) => {
				const target = entries[0];
				if (target.isIntersecting && hasMore && !isLoading) {
					loadMorePosts();
				}
			},
			{
				threshold: 0.1,
				rootMargin: "100px",
			},
		);

		const currentLoadingRef = loadingRef.current;
		observer.observe(currentLoadingRef);

		return () => {
			observer.unobserve(currentLoadingRef);
		};
	}, [hasMore, isLoading, loadMorePosts]);

	const handleCategoryClick = (categoryId: string) => {
		setSelectedCategory(categoryId);
	};

	return (
		<>
			<CookieBanner />

			<BlogPostHeader allPosts={allPosts} />

			<main className="min-h-screen bg-gray-50 dark:bg-black text-black dark:text-white">
				<div className="border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-950">
					<div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8">
						<div className="flex justify-between items-center gap-1.5 sm:gap-2 w-full overflow-x-auto sm:overflow-visible scrollbar-hide -mx-3 px-3 sm:mx-0 sm:px-0 py-3">
							{CATEGORIES.map((category) => {
								const Icon = category.icon;
								const isActive = selectedCategory === category.id;

								return (
									<button
										key={category.id}
										onClick={() => handleCategoryClick(category.id)}
										className={`flex items-center gap-1.5 shrink-0 py-2 px-3.5 sm:px-4 rounded-full border text-xs sm:text-sm font-semibold uppercase tracking-wide whitespace-nowrap transition-colors duration-200 cursor-pointer ${
											isActive
												? "border-blue-600 bg-blue-600 text-white"
												: "border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-gray-300 hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
										}`}
									>
										<Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
										{category.label}
									</button>
								);
							})}
						</div>
					</div>
				</div>

				<div className="max-w-6xl mx-auto px-3 sm:px-6 lg:px-8 py-8">
					<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 sm:gap-6">
						{displayedPosts.length > 0 ? (
							displayedPosts.map((post: BlogPost, index: number) => (
								<Link
									href={`/${post.slug}`}
									key={`${post.slug}-${index}`}
									prefetch={false}
									className="group flex flex-col rounded-2xl overflow-hidden bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300"
								>
									{post.cover && (
										<div className="relative w-full aspect-video overflow-hidden shrink-0 bg-gray-100 dark:bg-zinc-900">
											<Image
												src={post.cover}
												alt={post.title}
												fill
												className="object-cover transition-transform duration-700 group-hover:scale-105"
												priority={index < 2}
												fetchPriority={index < 2 ? "high" : "auto"}
												quality={85}
												sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
											/>
											{/* <span className="absolute top-3 left-3 bg-blue-600 text-white text-[10px] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full">
												{CATEGORIES.find((c) => c.id === post.category)?.label ?? post.category}
											</span> */}
										</div>
									)}

									<div className="p-4 flex flex-col flex-1 gap-2">
										<span className="text-[11px] font-medium text-gray-500 dark:text-gray-400">
											POSTADO EM {relativeDate(post.date).toUpperCase()}
										</span>

										<h3 className="font-bold text-base leading-snug text-gray-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors duration-300 line-clamp-2">
											{post.title}
										</h3>

										<p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed line-clamp-2 flex-1">
											{post.description}
										</p>

										{/* <div className="flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400 pt-2 mt-auto border-t border-gray-100 dark:border-zinc-900">
											<Clock className="w-3.5 h-3.5 shrink-0" />
											<span>
												{post.readingTime.replace(
													" min read",
													` ${parseInt(post.readingTime) > 1 ? "minutos de leitura" : "minuto de leitura"}`,
												)}
											</span>
										</div> */}
									</div>
								</Link>
							))
						) : (
							<div className="col-span-full text-center py-20">
								<p className="text-gray-700 text-lg dark:text-white">
									Nenhuma postagem encontrada nesta categoria.
								</p>
							</div>
						)}
					</div>

					<div ref={loadingRef} className="flex justify-center pt-8">
						{isLoading && (
							<div className="flex items-center gap-3 text-gray-700 dark:text-white">
								<div className="h-5 w-5 rounded-full border-2 border-blue-600 border-t-transparent animate-spin"></div>
								<span className="text-sm font-medium">Carregando mais postagens...</span>
							</div>
						)}
					</div>
				</div>
			</main>

			<Footer />
		</>
	);
}
