import path from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("../..", import.meta.url));

/** Longer specifiers first: Vite treats a string alias as a prefix. */
export const frameworkAliases = [
	{ find: "$app/env/private", replacement: path.join(root, "src/env.ts") },
	{ find: "$app/env", replacement: path.join(root, "src/shims/app-env.ts") },
	{ find: "$app/state", replacement: path.join(root, "src/shims/app-state.ts") },
	{ find: "$app/navigation", replacement: path.join(root, "src/shims/app-navigation.ts") },
	{ find: "@sveltejs/kit/hooks", replacement: path.join(root, "src/shims/kit-hooks.ts") },
	{ find: "@sveltejs/kit", replacement: path.join(root, "src/shims/kit.ts") },
	{ find: "#lib", replacement: path.join(root, "src/lib") },
];
