import type { z } from "zod";
import { isPublished, parsePost, referencedLists, serializePost } from "../content/parse.ts";
import {
	type Post,
	type PostInput,
	type Product,
	postInputSchema,
	productListSchema,
	slugSchema,
} from "../content/schema.ts";
import { validateBody } from "../content/validate-body.ts";
import {
	blobSha,
	type Commit,
	ConflictError,
	type ContentStore,
	decode,
	type Entry,
	encode,
} from "./store/types.ts";

const POSTS = "content/posts";
const PRODUCTS = "content/products";
const IMAGES = "static/images";

export const IMAGE_FOLDERS = ["covers", "posts"] as const;
export type ImageFolder = (typeof IMAGE_FOLDERS)[number];

const IMAGE_TYPES: Record<string, string> = {
	"image/webp": "webp",
	"image/jpeg": "jpg",
	"image/png": "png",
};
/** Keeps uploads within what the GitHub Contents API accepts comfortably and what a web page should load. */
export const MAX_IMAGE_BYTES = 4 * 1024 * 1024;

export type Author = Commit["author"];
export type PostStatus = "published" | "scheduled" | "draft" | "invalid";
export type PostSummary = Pick<Post, "slug" | "title" | "date" | "category" | "author" | "draft"> & {
	status: PostStatus;
	sha: string;
};

/** A request that cannot be fulfilled as sent. `issues` are safe to show to the editor. */
export class ValidationError extends Error {
	constructor(readonly issues: string[]) {
		super(issues.join(" "));
		this.name = "ValidationError";
	}
}

export class NotFoundError extends Error {
	constructor(what: string) {
		super(`${what} not found`);
		this.name = "NotFoundError";
	}
}

function parseOrThrow<T>(schema: z.ZodType<T>, value: unknown): T {
	const result = schema.safeParse(value);
	if (result.success) return result.data;
	throw new ValidationError(
		result.error.issues.map((issue) => `${issue.path.join(".") || "valor"}: ${issue.message}`),
	);
}

const postPath = (slug: string) => `${POSTS}/${parseOrThrow(slugSchema, slug)}.mdx`;
const listPath = (name: string) => `${PRODUCTS}/${parseOrThrow(slugSchema, name)}.json`;

const statusOf = (post: Post): PostStatus =>
	post.draft ? "draft" : isPublished(post) ? "published" : "scheduled";

// --- Posts ------------------------------------------------------------------------

/**
 * Every post in the store, newest first. `bundled` holds the sources compiled into this deploy:
 * files whose hash matches are parsed from memory, so only posts changed since the last deploy cost a request.
 */
export async function listPosts(
	store: ContentStore,
	bundled = new Map<string, string>(),
): Promise<PostSummary[]> {
	const known = new Map([...bundled].map(([slug, raw]) => [blobSha(encode(raw)), { slug, raw }]));
	const entries = (await store.list(POSTS)).filter((entry) => entry.name.endsWith(".mdx"));

	const summaries = await Promise.all(
		entries.map(async (entry: Entry): Promise<PostSummary> => {
			const slug = entry.name.replace(/\.mdx$/, "");
			const raw =
				known.get(entry.sha)?.raw ??
				decode((await store.read(entry.path))?.bytes ?? new Uint8Array());
			try {
				const { post } = parsePost(slug, raw);
				const { title, date, category, author, draft } = post;
				return { slug, title, date, category, author, draft, status: statusOf(post), sha: entry.sha };
			} catch {
				// Still listed so the editor can open and fix it.
				return {
					slug,
					title: slug,
					date: "",
					category: "",
					author: "",
					draft: true,
					status: "invalid",
					sha: entry.sha,
				};
			}
		}),
	);

	return summaries.sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function getPost(store: ContentStore, slug: string) {
	const file = await store.read(postPath(slug));
	if (!file) return null;
	const { post, body } = parsePost(slug, decode(file.bytes));
	return { post, body: body.trim(), sha: file.sha, status: statusOf(post) };
}

async function validatePost(store: ContentStore, input: unknown): Promise<PostInput> {
	const post = parseOrThrow(postInputSchema, input);

	const problems = validateBody(post.body);
	const lists = referencedLists(post.body);
	const found = await Promise.all(lists.map((list) => store.read(listPath(list))));
	for (const [index, list] of lists.entries()) {
		if (!found[index]) problems.push(`A lista de produtos "${list}" não existe.`);
	}
	if (problems.length > 0) throw new ValidationError(problems);

	return post;
}

/** Creates the post, or replaces the version identified by `sha`. */
export async function savePost(
	store: ContentStore,
	slug: string,
	input: unknown,
	author: Author,
	sha?: string,
) {
	const path = postPath(slug);
	const { body, ...frontmatter } = await validatePost(store, input);

	const result = await store.write(path, encode(serializePost(frontmatter, body)), {
		message: `content: ${sha ? "update" : "add"} post ${slug}`,
		author,
		sha,
	});
	return { slug, sha: result.sha };
}

export async function deletePost(store: ContentStore, slug: string, author: Author, sha: string) {
	const path = postPath(slug);
	if (!(await store.read(path))) throw new NotFoundError(`Post "${slug}"`);
	await store.remove(path, { message: `content: remove post ${slug}`, author, sha });
}

// --- Product lists ----------------------------------------------------------------

export async function listProductLists(store: ContentStore) {
	const entries = (await store.list(PRODUCTS)).filter((entry) => entry.name.endsWith(".json"));
	return entries.map((entry) => ({ name: entry.name.replace(/\.json$/, ""), sha: entry.sha }));
}

export async function getProductList(store: ContentStore, name: string) {
	const file = await store.read(listPath(name));
	if (!file) return null;
	return { name, products: productListSchema.parse(JSON.parse(decode(file.bytes))), sha: file.sha };
}

export async function saveProductList(
	store: ContentStore,
	name: string,
	input: unknown,
	author: Author,
	sha?: string,
) {
	const path = listPath(name);
	const products: Product[] = parseOrThrow(productListSchema.min(1, "Adicione ao menos um produto"), input);

	const ids = products.map((product) => product.id);
	const repeated = ids.filter((id, index) => ids.indexOf(id) !== index);
	if (repeated.length > 0)
		throw new ValidationError([`Id de produto repetido: ${[...new Set(repeated)].join(", ")}.`]);

	const result = await store.write(path, encode(`${JSON.stringify(products, null, "\t")}\n`), {
		message: `content: ${sha ? "update" : "add"} product list ${name}`,
		author,
		sha,
	});
	return { name, sha: result.sha };
}

// --- Images -----------------------------------------------------------------------

/** Turns "Minha Foto (1).PNG" into "minha-foto-1". */
export function slugifyFilename(filename: string): string {
	return filename
		.replace(/\.[^.]+$/, "")
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 80);
}

export async function listImages(store: ContentStore, folder: ImageFolder) {
	const entries = await store.list(`${IMAGES}/${folder}`);
	return entries
		.filter((entry) => /\.(webp|jpe?g|png)$/i.test(entry.name))
		.map((entry) => `/images/${folder}/${entry.name}`);
}

/** Stores an image and returns its public URL. The type is taken from the bytes, never from the filename. */
export async function uploadImage(
	store: ContentStore,
	file: { folder: string; filename: string; type: string; bytes: Uint8Array },
	author: Author,
) {
	if (!IMAGE_FOLDERS.includes(file.folder as ImageFolder))
		throw new ValidationError(["Pasta de imagem inválida."]);
	if (file.bytes.byteLength === 0) throw new ValidationError(["O arquivo está vazio."]);
	if (file.bytes.byteLength > MAX_IMAGE_BYTES) throw new ValidationError(["A imagem passa de 4 MB."]);

	const extension = IMAGE_TYPES[sniffImageType(file.bytes) ?? ""];
	if (!extension) throw new ValidationError(["Envie uma imagem WebP, JPEG ou PNG."]);

	const base = slugifyFilename(file.filename) || "imagem";
	const commit = { message: `content: add image ${base}.${extension}`, author };

	// A name clash gets a numeric suffix instead of overwriting an image other posts may use.
	for (let attempt = 0; attempt < 20; attempt++) {
		const name = `${base}${attempt === 0 ? "" : `-${attempt + 1}`}.${extension}`;
		try {
			await store.write(`${IMAGES}/${file.folder}/${name}`, file.bytes, commit);
			return { url: `/images/${file.folder}/${name}` };
		} catch (error) {
			if (!(error instanceof ConflictError)) throw error;
		}
	}
	throw new ValidationError(["Já existem muitas imagens com esse nome. Renomeie o arquivo."]);
}

/** Detects the real format from the file signature. */
function sniffImageType(bytes: Uint8Array): string | undefined {
	const ascii = (start: number, end: number) => String.fromCharCode(...bytes.slice(start, end));
	if (bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) return "image/jpeg";
	if (bytes[0] === 0x89 && ascii(1, 4) === "PNG") return "image/png";
	if (ascii(0, 4) === "RIFF" && ascii(8, 12) === "WEBP") return "image/webp";
	return undefined;
}
