import fs from "node:fs";
import path from "node:path";

const SITE_URL = "https://example.com";
const SITEMAP_PATH = path.join(process.cwd(), "public", "sitemap.xml");

interface LanguageContentPath {
	language: string;
	prefix: string;
	dir: string;
}

function getLanguageContentPaths(): LanguageContentPath[] {
	const basePath = path.join(process.cwd(), "app");
	const results: LanguageContentPath[] = [];

	const rootSlugContent = path.join(basePath, "[slug]", "content");
	if (fs.existsSync(rootSlugContent)) {
		results.push({ language: "en", prefix: "", dir: rootSlugContent });
	}

	const entries = fs.readdirSync(basePath, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory() || entry.name === "[slug]") continue;

		const candidate = path.join(basePath, entry.name, "[slug]", "content");

		if (fs.existsSync(candidate)) {
			results.push({
				language: entry.name,
				prefix: entry.name,
				dir: candidate,
			});
		}
	}

	return results;
}

function getAllMdxSlugs(dir: string): string[] {
	try {
		return fs
			.readdirSync(dir)
			.filter((file) => file.endsWith(".mdx"))
			.map((file) => file.replace(/\.mdx$/, ""));
	} catch {
		return [];
	}
}

function getSlugsFromSitemap(): Set<string> {
	if (!fs.existsSync(SITEMAP_PATH)) {
		throw new Error("❌ sitemap.xml não encontrado em /public");
	}

	const xml = fs.readFileSync(SITEMAP_PATH, "utf8");
	const locRegex = /<loc>(.*?)<\/loc>/g;
	const slugs = new Set<string>();

	let match: RegExpExecArray | null;

	while ((match = locRegex.exec(xml)) !== null) {
		const url = match[1].trim();

		if (!url.startsWith(SITE_URL)) continue;

		const slug = url.replace(SITE_URL, "").replace(/^\/+/, "").replace(/\/+$/, "");

		if (slug) {
			slugs.add(slug);
		}
	}

	return slugs;
}

function checkMissingSlugs(): void {
	console.log("\n🔎 Verificando sitemap — todos os idiomas\n");

	const languagePaths = getLanguageContentPaths();

	if (languagePaths.length === 0) {
		console.log("⚠️ Nenhuma pasta de conteúdo encontrada");
		return;
	}

	const sitemapSlugs = getSlugsFromSitemap();
	let missingCount = 0;
	let totalSlugs = 0;

	for (const { language, prefix, dir } of languagePaths) {
		const mdxSlugs = getAllMdxSlugs(dir);

		if (mdxSlugs.length === 0) continue;

		console.log(`📂 ${language.toUpperCase()} (${mdxSlugs.length} arquivos)`);

		mdxSlugs.forEach((slug) => {
			totalSlugs++;
			const fullSlug = prefix ? `${prefix}/${slug}` : slug;

			if (!sitemapSlugs.has(fullSlug)) {
				console.log(`❌ SLUG AUSENTE NO SITEMAP → ${fullSlug}`);
				missingCount++;
			}
		});
	}

	console.log(`\n📊 Total de slugs verificados: ${totalSlugs}`);

	if (missingCount === 0) {
		console.log("✅ Todos os slugs estão presentes no sitemap!");
	} else {
		console.log(`🚨 Total de slugs faltando no sitemap: ${missingCount}`);
		process.exit(1);
	}
}

function main() {
	checkMissingSlugs();
}

if (require.main === module) {
	main();
}
