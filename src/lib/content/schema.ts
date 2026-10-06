import { z } from "zod";
import { site } from "../site.config.ts";

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const categoryIds = site.categories.map((category) => category.id) as [string, ...string[]];
const authorIds = Object.keys(site.authors) as [string, ...string[]];

export const faqItemSchema = z.object({
	question: z.string().min(1),
	answer: z.string().min(1),
});

/** Frontmatter of a post in `content/posts/<slug>.mdx`. */
export const postFrontmatterSchema = z.object({
	title: z.string().min(1),
	description: z.string().default(""),
	/** Publication date (YYYY-MM-DD). A future date schedules the post. */
	date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Use the YYYY-MM-DD format"),
	category: z.enum(categoryIds),
	cover: z.string().default(""),
	draft: z.boolean().default(false),
	author: z.enum(authorIds).default(site.defaultAuthor),
	faqData: z.array(faqItemSchema).default([]),
	blogPostId: z.number().optional(),
	ref: z.string().optional(),
});

export const technicalDetailSchema = z.object({
	label: z.string().min(1),
	value: z.string(),
});

const optionalUrl = z.string().nullish();

/** One product inside a list in `content/products/<list>.json`. Unknown keys are kept as they are. */
export const productSchema = z.looseObject({
	id: z.string().min(1),
	name: z.string().min(1),
	image: z.string().min(1),
	mercadolivreUrl: optionalUrl,
	shopeeUrl: optionalUrl,
	amazonUrl: optionalUrl,
	advantages: z.array(z.string()).default([]),
	technicalDetails: z.array(technicalDetailSchema).default([]),
});

export const productListSchema = z.array(productSchema);

export type FaqItem = z.infer<typeof faqItemSchema>;
export type PostFrontmatter = z.infer<typeof postFrontmatterSchema>;
export type Product = z.infer<typeof productSchema>;

/** A post as exposed to pages and to the REST API. */
export type Post = PostFrontmatter & {
	slug: string;
	readingMinutes: number;
	wordCount: number;
};
