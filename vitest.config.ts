import { defineConfig } from "vitest/config";
import { frameworkAliases } from "./src/shims/aliases.ts";

export default defineConfig({
	resolve: { alias: frameworkAliases },
	test: {
		environment: "node",
		include: [
			"src/**/*.test.ts",
			"webscrapping/**/*.test.ts",
			"tests/unit/**/*.test.ts",
			"tests/integration/**/*.test.ts",
		],
	},
});
