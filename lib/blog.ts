"use server";

import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import readingTime from "reading-time";

export interface BlogPost {
	slug: string;
	title: string;
	date: string;
	description: string;
	cover: string;
	content: string;
	readingTime: string;
	category: string;
	language?: string;
	draft: boolean;
	faqData: any[];
	patrocinado?: boolean;
	author: string;
}

export type Language = string;

function isPostPublished(date: string): boolean {
	const today = new Date().toISOString().split("T")[0];
	return date <= today;
}

function findMdxFiles(dir: string): string[] {
	const files: string[] = [];

	if (!fs.existsSync(/* turbopackIgnore: true */ dir)) {
		return files;
	}

	const items = fs.readdirSync(/* turbopackIgnore: true */ dir);

	for (const item of items) {
		const fullPath = path.join(dir, item);
		const stat = fs.statSync(/* turbopackIgnore: true */ fullPath);

		if (stat.isDirectory()) {
			files.push(...findMdxFiles(fullPath));
		} else if (item.endsWith(".mdx")) {
			files.push(fullPath);
		}
	}

	return files;
}

function getLanguageFromPath(filePath: string): Language {
	if (filePath.includes("/app/es/")) return "es";
	if (filePath.includes("/app/pt")) return "pt";
	if (filePath.includes("/app/[slug]/")) return "en";
	return "en";
}

function getContentDirectoryForLanguage(language: Language): string {
	const basePath = path.join(process.cwd(), "app");

	if (language === "en") {
		return path.join(basePath, "[slug]", "content");
	}

	return path.join(basePath, language, "[slug]", "content");
}

export async function getBlogPosts(language?: Language): Promise<BlogPost[]> {
	const contentDirectories = language
		? [getContentDirectoryForLanguage(language)]
		: [
				path.join(process.cwd(), "app/[slug]/content"),
				path.join(process.cwd(), "app/es/[slug]/content"),
				path.join(process.cwd(), "app/pt/[slug]/content"),
			];

	const allMdxFiles: string[] = [];

	for (const dir of contentDirectories) {
		allMdxFiles.push(...findMdxFiles(dir));
	}

	const allPostsData = allMdxFiles.map((filePath) => {
		const fileName = path.basename(filePath);
		const slug = fileName.replace(/\.mdx$/, "");
		const fileContents = fs.readFileSync(/* turbopackIgnore: true */ filePath, "utf8");
		const { data, content } = matter(fileContents);
		const detectedLanguage = getLanguageFromPath(filePath);

		return {
			slug,
			title: data.title || "Not Found",
			date: data.date || new Date().toISOString().split("T")[0],
			description: data.description || "",
			cover: data.cover || "",
			content,
			readingTime: readingTime(content).text,
			category: data.category || "uncategorized",
			language: data.language || detectedLanguage,
			draft: data.draft || false,
			faqData: data.faqData || [],
			patrocinado: data.patrocinado || false,
			author: data.author || "bruno",
		};
	});

	const publishedPosts = allPostsData.filter((post) => !post.draft && isPostPublished(post.date));

	const filteredPosts = language ? publishedPosts.filter((post) => post.language === language) : publishedPosts;

	return filteredPosts.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getBlogPost(slug: string, language: Language = "en"): Promise<BlogPost | null> {
	try {
		const contentDirectories = [getContentDirectoryForLanguage(language)];

		let filePath: string | null = null;

		for (const dir of contentDirectories) {
			const allMdxFiles = findMdxFiles(dir);
			const foundFile = allMdxFiles.find((file) => path.basename(file) === `${slug}.mdx`);

			if (foundFile) {
				filePath = foundFile;
				break;
			}
		}

		if (!filePath) return null;

		const fileContents = fs.readFileSync(/* turbopackIgnore: true */ filePath, "utf8");
		const { data, content } = matter(fileContents);
		const detectedLanguage = getLanguageFromPath(filePath);

		if (data.draft) return null;
		if (!isPostPublished(data.date)) return null;

		const post: BlogPost = {
			slug,
			title: data.title || "Not Found",
			date: data.date,
			description: data.description || "",
			cover: data.cover || "",
			content,
			readingTime: readingTime(content).text,
			category: data.category || "uncategorized",
			language: data.language || detectedLanguage,
			draft: data.draft || false,
			faqData: data.faqData || [],
			patrocinado: data.patrocinado || false,
			author: data.author || "bruno",
		};

		if (post.language !== language) return null;

		return post;
	} catch (error) {
		console.error("Erro ao buscar post:", error);
		return null;
	}
}

export async function getAllPostSlugs(language?: Language): Promise<string[]> {
	const contentDirectories = language
		? [getContentDirectoryForLanguage(language)]
		: [
				path.join(process.cwd(), "app/[slug]/content"),
				path.join(process.cwd(), "app/es/[slug]/content"),
				path.join(process.cwd(), "app/pt/[slug]/content"),
			];

	const allMdxFiles: string[] = [];

	for (const dir of contentDirectories) {
		allMdxFiles.push(...findMdxFiles(dir));
	}

	const validFiles = allMdxFiles.filter((filePath) => {
		const fileContents = fs.readFileSync(/* turbopackIgnore: true */ filePath, "utf8");
		const { data } = matter(fileContents);

		if (data.draft) return false;
		if (!isPostPublished(data.date)) return false;

		if (language) {
			const detectedLanguage = getLanguageFromPath(filePath);
			return detectedLanguage === language;
		}

		return true;
	});

	return validFiles.map((filePath) => path.basename(filePath).replace(/\.mdx$/, ""));
}

export async function getBlogPostsByCategory(category: string, language?: Language): Promise<BlogPost[]> {
	const allPosts = await getBlogPosts(language);
	return allPosts.filter((post) => post.category === category);
}

export async function getAllCategories(language?: Language): Promise<string[]> {
	const allPosts = await getBlogPosts(language);
	return [
		...new Set(allPosts.map((post) => post.category).filter((category): category is string => Boolean(category))),
	];
}
