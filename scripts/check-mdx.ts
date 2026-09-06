import fs from "node:fs";
import path from "node:path";

const validCategories = ["all", "ferramentas", "limpeza", "climatizacao", "moveis", "lavanderia", "cozinha"];

interface LanguageContentPath {
	language: string;
	dir: string;
}

interface FrontmatterData {
	draft: boolean;
	date: string | null;
	cover: string | null;
	blogPostId?: number | null;
	category: string | null;
}

function getLanguageContentPaths(): LanguageContentPath[] {
	const basePath = path.join(process.cwd(), "app");
	const results: LanguageContentPath[] = [];

	const rootSlugContent = path.join(basePath, "[slug]", "content");
	if (fs.existsSync(rootSlugContent)) {
		results.push({ language: "en", dir: rootSlugContent });
	}

	const entries = fs.readdirSync(basePath, { withFileTypes: true });

	for (const entry of entries) {
		if (!entry.isDirectory() || entry.name === "[slug]") continue;

		const candidate = path.join(basePath, entry.name, "[slug]", "content");

		if (fs.existsSync(candidate)) {
			results.push({ language: entry.name, dir: candidate });
		}
	}

	return results;
}

function getAllMdxFiles(dir: string): string[] {
	try {
		return fs
			.readdirSync(dir)
			.filter((file) => file.endsWith(".mdx"))
			.map((file) => path.join(dir, file));
	} catch {
		return [];
	}
}

function extractFrontmatter(filePath: string): FrontmatterData {
	try {
		const content = fs.readFileSync(filePath, "utf8");

		const draftMatch = content.match(/^draft:\s*(.+)$/m);
		const draft = draftMatch ? draftMatch[1].trim() === "true" : false;

		const categoryMatch = content.match(/^category:\s*["']?(.+?)["']?$/m);
		const category = categoryMatch ? categoryMatch[1].trim() : null;

		const dateMatch = content.match(/^date:\s*["']?(.+?)["']?$/m);
		const date = dateMatch ? dateMatch[1].trim() : null;

		const coverMatch = content.match(/^cover:\s*["']?(.+?)["']?$/m);
		const cover = coverMatch ? coverMatch[1].trim() : null;

		return { draft, date, cover, category };
	} catch {
		return { draft: false, date: null, cover: null, blogPostId: null, category: null };
	}
}

function isValidDate(dateString: string): boolean {
	const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
	if (!dateRegex.test(dateString)) {
		return false;
	}

	const date = new Date(dateString);
	const timestamp = date.getTime();

	if (typeof timestamp !== "number" || Number.isNaN(timestamp)) {
		return false;
	}

	return date.toISOString().startsWith(dateString);
}

function checkCategories(): void {
	console.log("\n🔍 Verificando categorias — todos os idiomas\n");

	const languagePaths = getLanguageContentPaths();

	if (languagePaths.length === 0) {
		console.log("⚠️ Nenhuma pasta de conteúdo encontrada");
		return;
	}

	let invalidCount = 0;
	const blogPostIds = new Set<number>();

	for (const { language, dir } of languagePaths) {
		const mdxFiles = getAllMdxFiles(dir);

		if (mdxFiles.length === 0) continue;

		console.log(`📂 ${language.toUpperCase()} (${mdxFiles.length} arquivos)`);

		mdxFiles.forEach((filePath) => {
			const fileName = path.basename(filePath);
			const frontmatter = extractFrontmatter(filePath);

			if (frontmatter.draft) {
				console.log(`⏭️  DRAFT → ${fileName} (pulando validações)`);
				return;
			}

			let hasError = false;

			if (!frontmatter.category) {
				console.log(`❌ CATEGORY AUSENTE → ${fileName}`);
				hasError = true;
			} else if (!validCategories.includes(frontmatter.category)) {
				console.log(`❌ CATEGORY INVÁLIDA → ${fileName} (category: "${frontmatter.category}")`);
				hasError = true;
			}

			if (!frontmatter.date) {
				console.log(`❌ DATE AUSENTE → ${fileName}`);
				hasError = true;
			} else if (!isValidDate(frontmatter.date)) {
				console.log(`❌ DATE FORMATO INVÁLIDO → ${fileName} (date: "${frontmatter.date}") - Use YYYY-MM-DD`);
				hasError = true;
			}

			if (!frontmatter.cover) {
				console.log(`❌ COVER AUSENTE → ${fileName}`);
				hasError = true;
			} else {
				if (!frontmatter.cover.startsWith("/images/covers/")) {
					console.log(
						`❌ COVER PATH INVÁLIDO → ${fileName} (cover: "${frontmatter.cover}") - Deve começar com "/images/covers/"`,
					);
					hasError = true;
				}
			}

			if (hasError) {
				invalidCount++;
			}
		});
	}

	if (blogPostIds.size > 0) {
		const maxId = Math.max(...Array.from(blogPostIds));
		const missingIds: number[] = [];

		for (let i = 1; i <= maxId; i++) {
			if (!blogPostIds.has(i)) {
				missingIds.push(i);
			}
		}

		console.log(`\n📊 ANÁLISE DE IDs:`);
		console.log(`   • ID máximo encontrado: ${maxId}`);
		console.log(`   • Total de IDs em uso: ${blogPostIds.size}`);

		if (missingIds.length > 0) {
			console.log(`   • IDs faltantes no range [1-${maxId}]: ${missingIds.join(", ")}`);
			console.log(`   • Total de IDs disponíveis: ${missingIds.length}`);
		} else {
			console.log(`   • Todos os IDs de 1 a ${maxId} estão em uso! ✅`);
		}
	}

	if (invalidCount === 0) {
		console.log("\n✅ Todas as validações passaram!");
	} else {
		console.log(`\n🚨 Total de arquivos com problema: ${invalidCount}`);
		process.exit(1);
	}
}

function main() {
	checkCategories();
}

if (require.main === module) {
	main();
}
