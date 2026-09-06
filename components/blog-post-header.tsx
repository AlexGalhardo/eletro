"use client";

import { useState, useEffect, useRef, useCallback, useMemo } from "react";
import { Search, X, Sun, Moon, Menu, Newspaper } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import Fuse from "fuse.js";
import { BlogPost } from "@/lib/blog";
import MobileSidebar from "@/components/mobile-sidebar";

interface BlogPostHeaderProps {
	allPosts: BlogPost[];
}

export default function BlogPostHeader({ allPosts }: BlogPostHeaderProps) {
	const [searchTerm, setSearchTerm] = useState("");
	const [showSuggestions, setShowSuggestions] = useState(false);
	const [isSearchOpen, setIsSearchOpen] = useState(false);
	const [selectedIndex, setSelectedIndex] = useState(-1);
	const [mounted, setMounted] = useState(false);
	const [isSidebarOpen, setIsSidebarOpen] = useState(false);
	const [isRecentOpen, setIsRecentOpen] = useState(false);

	const desktopSearchRef = useRef<HTMLDivElement>(null);
	const mobileSearchRef = useRef<HTMLDivElement>(null);
	const desktopInputRef = useRef<HTMLInputElement>(null);
	const mobileInputRef = useRef<HTMLInputElement>(null);

	const { theme, setTheme } = useTheme();
	const router = useRouter();

	useEffect(() => {
		setMounted(true);
	}, []);

	const filteredPosts = useMemo(() => {
		if (searchTerm.length >= 2) {
			const fuse = new Fuse(allPosts, {
				keys: ["title"],
				threshold: 0.4,
				distance: 200,
				ignoreLocation: true,
				minMatchCharLength: 1,
				useExtendedSearch: true,
				includeScore: true,
				getFn: (obj, path) => {
					const value = Fuse.config.getFn(obj, path);
					if (typeof value === "string") {
						return value
							.normalize("NFD")
							.replaceAll(/[\u0300-\u036f]/g, "")
							.toLowerCase();
					}
					return value;
				},
			});

			const normalizedSearch = searchTerm
				.normalize("NFD")
				.replaceAll(/[\u0300-\u036f]/g, "")
				.toLowerCase()
				.trim();

			const results = fuse.search(normalizedSearch);
			return results.slice(0, 6).map((result) => result.item);
		}

		return [];
	}, [searchTerm, allPosts]);

	useEffect(() => {
		setShowSuggestions(filteredPosts.length > 0 && searchTerm.length >= 3);
		setSelectedIndex(-1);
	}, [filteredPosts, searchTerm]);

	useEffect(() => {
		const handleClickOutside = (event: MouseEvent) => {
			const target = event.target as Node;
			const clickedOutsideDesktop = desktopSearchRef.current && !desktopSearchRef.current.contains(target);
			const clickedOutsideMobile = mobileSearchRef.current && !mobileSearchRef.current.contains(target);

			if (clickedOutsideDesktop && clickedOutsideMobile) {
				setShowSuggestions(false);
				setSelectedIndex(-1);
			}
		};

		if (showSuggestions) {
			document.addEventListener("mousedown", handleClickOutside);
			return () => document.removeEventListener("mousedown", handleClickOutside);
		}
	}, [showSuggestions]);

	const handlePostSelect = useCallback(
		(post: BlogPost) => {
			router.push(`/${post.slug}`);
			setShowSuggestions(false);
			setSearchTerm("");
			setIsSearchOpen(false);
		},
		[router],
	);

	const handleKeyDown = useCallback(
		(e: React.KeyboardEvent) => {
			if (!showSuggestions || filteredPosts.length === 0) {
				if (e.key === "Escape") {
					setIsSearchOpen(false);
				}
				return;
			}

			switch (e.key) {
				case "ArrowDown":
					e.preventDefault();
					setSelectedIndex((prev) => (prev < filteredPosts.length - 1 ? prev + 1 : 0));
					break;
				case "ArrowUp":
					e.preventDefault();
					setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filteredPosts.length - 1));
					break;
				case "Enter":
					e.preventDefault();
					if (selectedIndex >= 0 && filteredPosts[selectedIndex]) {
						handlePostSelect(filteredPosts[selectedIndex]);
					}
					break;
				case "Escape":
					setShowSuggestions(false);
					setSelectedIndex(-1);
					setIsSearchOpen(false);
					break;
			}
		},
		[showSuggestions, filteredPosts, selectedIndex, handlePostSelect],
	);

	const SuggestionsList = useCallback(
		({ posts, onSelect }: { posts: BlogPost[]; onSelect: (post: BlogPost) => void }) => (
			<div className="absolute top-full left-0 right-0 bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl z-50 max-h-80 overflow-y-auto mt-2">
				{posts.map((post, index) => {
					const isSelected = index === selectedIndex;

					return (
						<div
							key={post.slug}
							className={`p-4 cursor-pointer transition-colors duration-150 border-b border-gray-100 dark:border-zinc-900 last:border-b-0 ${
								isSelected
									? "bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400"
									: "text-gray-900 dark:text-gray-100 hover:bg-gray-50 dark:hover:bg-zinc-900"
							}`}
							onMouseDown={(e) => {
								e.preventDefault();
								onSelect(post);
							}}
						>
							<div className="font-medium text-sm line-clamp-2">{post.title}</div>
						</div>
					);
				})}
			</div>
		),
		[selectedIndex],
	);

	return (
		<>
			<div className="sticky top-0 z-50 bg-white/90 dark:bg-zinc-950/90 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800">
				<div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
					<header className="text-black dark:text-white">
						<div className="py-3.5 flex items-center justify-between gap-3 sm:gap-4">
							<button
								type="button"
								onClick={() => setIsSidebarOpen(true)}
								aria-label="Abrir menu"
								className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors shrink-0"
							>
								<Menu className="h-5 w-5" />
							</button>

							<div className="shrink-0">
								<Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
									<Image src="/logo.png" alt="Logo" width={36} height={36} priority quality={75} />
									<span className="font-russo-one uppercase text-lg leading-none text-black dark:text-white">
										Eletro<span className="text-green-600 dark:text-green-500"> Radar</span>
									</span>
								</Link>
							</div>

							<div className="hidden lg:flex relative flex-1 mx-2" ref={desktopSearchRef}>
								<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
								<input
									ref={desktopInputRef}
									type="text"
									placeholder="Buscar postagem, produto, marca..."
									value={searchTerm}
									onChange={(e) => setSearchTerm(e.target.value)}
									onKeyDown={handleKeyDown}
									onFocus={() => {
										if (searchTerm.length >= 3 && filteredPosts.length > 0) {
											setShowSuggestions(true);
										}
									}}
									className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-gray-500 dark:placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 dark:focus:border-blue-500 transition-colors"
								/>
								{showSuggestions && filteredPosts.length > 0 && (
									<SuggestionsList posts={filteredPosts} onSelect={handlePostSelect} />
								)}
							</div>

							<div className="flex items-center gap-1 sm:gap-2 ml-auto shrink-0">
								<button
									type="button"
									onClick={() => setIsSearchOpen(!isSearchOpen)}
									aria-label="Buscar"
									className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
								>
									{isSearchOpen ? <X className="h-5 w-5" /> : <Search className="h-5 w-5" />}
								</button>

								<button
									type="button"
									onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
									aria-label="Alternar tema"
									className="inline-flex items-center justify-center w-9 h-9 rounded-lg text-gray-700 dark:text-white hover:bg-gray-100 dark:hover:bg-zinc-900 transition-colors"
								>
									{mounted &&
										(theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />)}
								</button>
							</div>
						</div>

						{isSearchOpen && (
							<div className="pb-4 lg:hidden" ref={mobileSearchRef}>
								<div className="relative">
									<Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none z-10" />
									<input
										autoFocus
										ref={mobileInputRef}
										type="text"
										placeholder="Buscar postagem, produto, marca..."
										value={searchTerm}
										onChange={(e) => setSearchTerm(e.target.value)}
										onKeyDown={handleKeyDown}
										onFocus={() => {
											if (searchTerm.length >= 3 && filteredPosts.length > 0) {
												setShowSuggestions(true);
											}
										}}
										className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-black dark:text-white placeholder:text-gray-500"
									/>
									{showSuggestions && filteredPosts.length > 0 && (
										<SuggestionsList posts={filteredPosts} onSelect={handlePostSelect} />
									)}
								</div>
							</div>
						)}
					</header>
				</div>
			</div>

			<MobileSidebar
				isOpen={isSidebarOpen}
				onClose={() => setIsSidebarOpen(false)}
				onOpenRecent={() => {
					setIsSidebarOpen(false);
					setIsRecentOpen(true);
				}}
			/>
		</>
	);
}
