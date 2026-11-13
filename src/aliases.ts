import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));

/** Vite does not always apply the package.json import map. Longer prefixes are not required here. */
export const aliases = [
	{ find: "#env", replacement: path.join(root, "src/env.ts") },
	{ find: "#lib", replacement: path.join(root, "src/lib") },
];
