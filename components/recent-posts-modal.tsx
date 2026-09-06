"use client";

import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { X, ChevronLeft, ChevronRight, Calendar } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { BlogPost } from "@/lib/blog";

interface RecentPostsModalProps {
	posts: BlogPost[];
	isOpen: boolean;
	onClose: () => void;
}

const POSTS_PER_PAGE = 3;
const TOTAL_POSTS = 9;

export default function RecentPostsModal({ posts, isOpen, onClose }: RecentPostsModalProps) {
	const trackRef = useRef<HTMLDivElement>(null);
	const [activePage, setActivePage] = useState(0);

	const recentPosts = useMemo(() => posts.slice(0, TOTAL_POSTS), [posts]);

	const pages = useMemo(() => {
		const chunks: BlogPost[][] = [];
		for (let i = 0; i < recentPosts.length; i += POSTS_PER_PAGE) {
			chunks.push(recentPosts.slice(i, i + POSTS_PER_PAGE));
		}
		return chunks;
	}, [recentPosts]);

	useEffect(() => {
		if (!isOpen) return;

		document.body.style.overflow = "hidden";
		setActivePage(0);
		if (trackRef.current) {
			trackRef.current.scrollTo({ left: 0 });
		}

		return () => {
			document.body.style.overflow = "";
		};
	}, [isOpen]);

	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === "Escape") onClose();
		};

		document.addEventListener("keydown", handleKeyDown);
		return () => document.removeEventListener("keydown", handleKeyDown);
	}, [isOpen, onClose]);

	const handleScroll = useCallback(() => {
		const track = trackRef.current;
		if (!track || track.clientWidth === 0) return;
		const page = Math.round(track.scrollLeft / track.clientWidth);
		setActivePage(page);
	}, []);

	const scrollToPage = useCallback((page: number) => {
		const track = trackRef.current;
		if (!track) return;
		const clamped = Math.max(0, Math.min(page, track.children.length - 1));
		track.scrollTo({ left: clamped * track.clientWidth, behavior: "smooth" });
	}, []);

	if (!isOpen) return null;

	return (
		<div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
			<div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} aria-hidden="true" />

			<div className="relative w-full max-w-3xl max-h-[85vh] bg-white dark:bg-zinc-950 rounded-2xl shadow-2xl border border-gray-200 dark:border-zinc-800 flex flex-col overflow-hidden">
				<div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
					<h2 className="font-bold text-lg text-black dark:text-white">Últimas postagens</h2>
					<button
						type="button"
						onClick={onClose}
						aria-label="Fechar"
						className="inline-flex items-center justify-center w-8 h-8 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-zinc-900 dark:text-gray-300 transition-colors"
					>
						<X className="h-5 w-5" />
					</button>
				</div>

				<div className="relative flex-1 overflow-hidden">
					{pages.length === 0 ? (
						<p className="p-8 text-center text-gray-600 dark:text-gray-300">Nenhuma postagem encontrada.</p>
					) : (
						<>
							<div
								ref={trackRef}
								onScroll={handleScroll}
								className="flex h-full overflow-x-auto snap-x snap-mandatory scrollbar-hide scroll-smooth"
							>
								{pages.map((page, pageIndex) => (
									<div
										key={pageIndex}
										className="w-full shrink-0 snap-start overflow-y-auto p-5 grid grid-cols-1 sm:grid-cols-3 gap-4 content-start"
									>
										{page.map((post) => (
											<Link
												key={post.slug}
												href={`/${post.slug}`}
												onClick={onClose}
												prefetch={false}
												className="group flex flex-col rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 hover:border-blue-500 dark:hover:border-blue-500 transition-colors"
											>
												<div className="relative w-full aspect-video bg-gray-100 dark:bg-zinc-900 overflow-hidden">
													{post.cover && (
														<Image
															src={post.cover}
															alt={post.title}
															fill
															className="object-cover transition-transform duration-500 group-hover:scale-105"
															sizes="(max-width: 640px) 100vw, 33vw"
														/>
													)}
												</div>
												<div className="p-3 flex flex-col gap-1.5">
													<span className="text-[10px] font-bold uppercase tracking-wide text-blue-600 dark:text-blue-400">
														{post.category}
													</span>
													<h3 className="text-sm font-semibold leading-snug line-clamp-2 text-black dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
														{post.title}
													</h3>
													<span className="mt-1 flex items-center gap-1 text-[11px] text-gray-500 dark:text-gray-400">
														<Calendar className="w-3 h-3 shrink-0" />
														{new Date(`${post.date}T00:00:00`).toLocaleDateString("pt-BR", {
															day: "numeric",
															month: "short",
															year: "numeric",
														})}
													</span>
												</div>
											</Link>
										))}
									</div>
								))}
							</div>

							{pages.length > 1 && (
								<>
									<button
										type="button"
										onClick={() => scrollToPage(activePage - 1)}
										disabled={activePage === 0}
										aria-label="Postagens anteriores"
										className="hidden sm:inline-flex absolute left-2 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 shadow-md text-gray-700 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 transition-colors"
									>
										<ChevronLeft className="h-5 w-5" />
									</button>
									<button
										type="button"
										onClick={() => scrollToPage(activePage + 1)}
										disabled={activePage === pages.length - 1}
										aria-label="Próximas postagens"
										className="hidden sm:inline-flex absolute right-2 top-1/2 -translate-y-1/2 items-center justify-center w-9 h-9 rounded-full bg-white/90 dark:bg-zinc-900/90 border border-gray-200 dark:border-zinc-700 shadow-md text-gray-700 dark:text-white disabled:opacity-30 disabled:cursor-not-allowed hover:bg-white dark:hover:bg-zinc-800 transition-colors"
									>
										<ChevronRight className="h-5 w-5" />
									</button>
								</>
							)}
						</>
					)}
				</div>

				{pages.length > 1 && (
					<div className="flex items-center justify-center gap-2 py-3 border-t border-gray-200 dark:border-zinc-800 shrink-0">
						{pages.map((_, pageIndex) => (
							<button
								key={pageIndex}
								type="button"
								onClick={() => scrollToPage(pageIndex)}
								aria-label={`Ir para página ${pageIndex + 1}`}
								className={`h-2 rounded-full transition-all ${
									pageIndex === activePage ? "w-6 bg-blue-600" : "w-2 bg-gray-300 dark:bg-zinc-700"
								}`}
							/>
						))}
						<span className="ml-2 text-xs font-medium text-gray-500 dark:text-gray-400 tabular-nums">
							{activePage + 1} / {pages.length}
						</span>
					</div>
				)}
			</div>
		</div>
	);
}
