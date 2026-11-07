import { mkdir, readdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

// GitHub Pages picks Content-Type from the extension. An extensionless file is
// application/octet-stream, and index.html is text/html. index.json is the directory
// index it serves as application/json at the trailing-slash URL, which is the URL that
// returns 200. A `.json` suffix on the public path would be a different URL.
export async function publishJsonForPages(apiDir: string): Promise<void> {
	await rewrite(apiDir);
}

async function rewrite(dir: string): Promise<void> {
	const entries = await readdir(dir, { withFileTypes: true }).catch((error: NodeJS.ErrnoException) => {
		if (error.code === "ENOENT") return [];
		throw error;
	});

	for (const entry of entries) {
		if (entry.isDirectory()) await rewrite(path.join(dir, entry.name));
	}

	for (const entry of entries) {
		if (!entry.isFile()) continue;
		const full = path.join(dir, entry.name);
		if (entry.name.endsWith(".json")) continue;

		if (entry.name === "index.html") {
			await writeFile(path.join(dir, "index.json"), await readFile(full));
			await rm(full);
			continue;
		}

		const extension = path.extname(entry.name);
		if (extension && extension !== ".html") continue;

		const base = extension === ".html" ? entry.name.slice(0, -".html".length) : entry.name;
		const body = await readFile(full);
		await rm(full);
		const target = path.join(dir, base);
		await mkdir(target);
		await writeFile(path.join(target, "index.json"), body);
	}
}
