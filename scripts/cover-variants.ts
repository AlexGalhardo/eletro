import { mkdir, readdir, stat } from "node:fs/promises";
import path from "node:path";
import type { Plugin } from "vite";
import { COVER_WIDTHS } from "../src/lib/content/cover.ts";

const COVERS = "static/images/covers";

const modifiedAt = (file: string) =>
	stat(file).then(
		(info) => info.mtimeMs,
		() => 0,
	);

/**
 * Writes resized WebP copies of every cover to `static/images/covers/w<width>/`, where the pages find them
 * for `srcset`. Covers come from the repository and from uploads made in the dashboard, at whatever size
 * the author had (some are over 1 MB), so the copies are made here instead of being asked of the author.
 * The copies are build output: the folders are in `.gitignore`.
 */
export async function writeCoverVariants(root = process.cwd()): Promise<number> {
	const { default: sharp } = await import("sharp");
	const folder = path.join(root, COVERS);
	const files = (await readdir(folder, { withFileTypes: true }).catch(() => []))
		.filter((entry) => entry.isFile() && /\.(webp|jpe?g|png)$/i.test(entry.name))
		.map((entry) => entry.name);

	let written = 0;
	for (const width of COVER_WIDTHS) await mkdir(path.join(folder, `w${width}`), { recursive: true });

	await Promise.all(
		files.map(async (name) => {
			const source = path.join(folder, name);
			const { width: original = 0 } = await sharp(source).metadata();
			const changed = await modifiedAt(source);

			for (const width of COVER_WIDTHS) {
				const target = path.join(folder, `w${width}`, `${path.parse(name).name}.webp`);
				// Never enlarge, and skip what a previous build already made from this same file.
				if (original <= width || (await modifiedAt(target)) >= changed) continue;
				await sharp(source).resize({ width }).webp({ quality: 72 }).toFile(target);
				written += 1;
			}
		}),
	);
	return written;
}

/** Runs before every production build, whatever command started it (`bun run build`, the hosting platform). */
export function coverVariants(): Plugin {
	let done: Promise<number> | undefined;
	return {
		name: "cover-variants",
		apply: "build",
		// SvelteKit builds twice (server and client); the work is shared between the two.
		async buildStart() {
			done ??= writeCoverVariants();
			await done;
		},
	};
}
