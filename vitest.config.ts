import { defineConfig } from "vitest/config";
import { aliases } from "./src/aliases.ts";

export default defineConfig({
	resolve: { alias: aliases },
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
