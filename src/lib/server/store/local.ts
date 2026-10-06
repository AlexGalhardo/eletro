import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";
import { blobSha, ConflictError, type ContentStore } from "./types.ts";

const isMissing = (error: unknown) => (error as NodeJS.ErrnoException).code === "ENOENT";

/** Reads and writes the working copy. Used in development and tests; commits are left to the developer. */
export function createLocalStore(root: string): ContentStore {
	const resolve = (relative: string) => path.join(root, relative);

	async function read(relative: string) {
		try {
			const bytes = new Uint8Array(await readFile(resolve(relative)));
			return { path: relative, bytes, sha: blobSha(bytes) };
		} catch (error) {
			if (isMissing(error)) return null;
			throw error;
		}
	}

	return {
		kind: "local",
		read,

		async list(dir) {
			let names: string[];
			try {
				const entries = await readdir(resolve(dir), { withFileTypes: true });
				names = entries.filter((entry) => entry.isFile()).map((entry) => entry.name);
			} catch (error) {
				if (isMissing(error)) return [];
				throw error;
			}
			const files = await Promise.all(names.sort().map((name) => read(`${dir}/${name}`)));
			return files
				.filter((file) => file !== null)
				.map((file) => ({ name: path.posix.basename(file.path), path: file.path, sha: file.sha }));
		},

		async write(relative, bytes, { sha }) {
			const current = await read(relative);
			if ((current?.sha ?? undefined) !== sha) throw new ConflictError(relative);

			await mkdir(path.dirname(resolve(relative)), { recursive: true });
			await writeFile(resolve(relative), bytes);
			return { sha: blobSha(bytes) };
		},

		async remove(relative, { sha }) {
			const current = await read(relative);
			if (current?.sha !== sha) throw new ConflictError(relative);
			await rm(resolve(relative));
		},

		async history() {
			return [];
		},
	};
}
