// Runs before every build: registers every affiliate link of the published posts in the links dashboard and
// fails the build when it cannot, so no page goes live with a link the dashboard does not know. This also
// covers content committed straight to git, which never passes through the admin panel.
import { readdirSync, readFileSync } from "node:fs";
import {
	type CatalogueProduct,
	catalogueProblems,
	SyncError,
	syncCatalogue,
} from "../src/lib/affiliate-links.ts";
import { buildCatalogue } from "../src/lib/content/affiliate.ts";
import { isPublished, parsePost } from "../src/lib/content/parse.ts";
import { type Product, productListSchema } from "../src/lib/content/schema.ts";
import { site } from "../src/lib/site.config.ts";

function readCatalogue(): CatalogueProduct[] {
	const posts = readdirSync("content/posts")
		.filter((file) => file.endsWith(".mdx"))
		.map((file) =>
			parsePost(file.slice(0, -".mdx".length), readFileSync(`content/posts/${file}`, "utf8")),
		)
		.filter(({ post }) => isPublished(post));
	const lists = new Map<string, Product[]>(
		readdirSync("content/products")
			.filter((file) => file.endsWith(".json"))
			.map((file) => [
				file.slice(0, -".json".length),
				productListSchema.parse(JSON.parse(readFileSync(`content/products/${file}`, "utf8"))),
			]),
	);
	return buildCatalogue(posts, lists);
}

async function main(): Promise<number> {
	const products = readCatalogue();
	const problems = catalogueProblems(products);
	if (problems.length) {
		console.error(`Catálogo de links inválido (${problems.length}):\n- ${problems.join("\n- ")}`);
		return 1;
	}

	const token = process.env.LINKS_DASHBOARD_TOKEN;
	if (!token) {
		if (process.env.VERCEL_ENV === "production") {
			console.error("LINKS_DASHBOARD_TOKEN não definido: build de produção recusado.");
			return 1;
		}
		console.warn(
			`LINKS_DASHBOARD_TOKEN não definido: ${products.length} produtos validados, nada enviado.`,
		);
		return 0;
	}

	try {
		const summary = await syncCatalogue({ dashboardUrl: site.linksDashboardUrl, token, products });
		console.log(
			`Links sincronizados com ${site.linksDashboardUrl}: ${products.length} produtos ` +
				`(${summary.productsCreated} novos, ${summary.productsUpdated} atualizados, ` +
				`${summary.productsRemoved} removidos; links +${summary.linksAdded} -${summary.linksRemoved}).`,
		);
		return 0;
	} catch (error) {
		if (!(error instanceof SyncError)) throw error;
		console.error(error.message);
		return 1;
	}
}

main().then((code) => process.exit(code));
