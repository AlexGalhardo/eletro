import { createHash } from "node:crypto";

export type Entry = { name: string; path: string; sha: string };
export type StoredFile = { path: string; bytes: Uint8Array; sha: string };
/** One commit that touched the content, as shown on the dashboard. */
export type HistoryEntry = { sha: string; message: string; author: string; date: string; url: string };
export type Commit = { message: string; author: { name: string; email: string } };

/**
 * Where editable content lives. Paths are repository-relative with forward slashes
 * (e.g. `content/posts/my-post.mdx`). `sha` is the Git blob hash and works as a version:
 * writing or removing with a stale `sha` throws `ConflictError` instead of overwriting.
 */
export interface ContentStore {
	readonly kind: "github" | "local";
	list(dir: string): Promise<Entry[]>;
	read(path: string): Promise<StoredFile | null>;
	/** Creates the file when `sha` is omitted (failing if it exists) or replaces that exact version. */
	write(path: string, bytes: Uint8Array, commit: Commit & { sha?: string }): Promise<{ sha: string }>;
	remove(path: string, commit: Commit & { sha: string }): Promise<void>;
	/** Latest commits that touched `dir`, newest first. Empty where there is no history to read (local disk). */
	history(dir: string, limit: number): Promise<HistoryEntry[]>;
}

/**
 * The store cannot write where it is running. In practice: a serverless deploy without GITHUB_TOKEN and
 * GITHUB_REPO, which falls back to the local disk and finds it read-only.
 */
export class StoreUnavailableError extends Error {
	constructor(cause: unknown) {
		super(
			"The content store cannot write here. Set GITHUB_TOKEN and GITHUB_REPO to publish from this deploy.",
			{
				cause,
			},
		);
		this.name = "StoreUnavailableError";
	}
}

/** The file changed (or appeared) since the version the caller was working on. */
export class ConflictError extends Error {
	constructor(path: string) {
		super(`"${path}" was changed by someone else. Reload and try again.`);
		this.name = "ConflictError";
	}
}

/** Store paths are built from validated names, but a path that climbs out of the repository is refused anyway. */
export function assertSafePath(path: string): void {
	if (path.split("/").some((segment) => segment === ".." || segment === "." || segment === ""))
		throw new Error(`Unsafe content path: "${path}"`);
}

/** Same hash Git gives a file, so local and GitHub stores report identical versions. */
export function blobSha(bytes: Uint8Array): string {
	return createHash("sha1").update(`blob ${bytes.byteLength}\0`).update(bytes).digest("hex");
}

export const encode = (text: string) => new TextEncoder().encode(text);
export const decode = (bytes: Uint8Array) => new TextDecoder().decode(bytes);
