import fs from "node:fs";
import path from "node:path";

function formatDate(date: Date): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	const day = String(date.getDate()).padStart(2, "0");
	return `${year}-${month}-${day}`;
}

function getContentPath(): string {
	return path.join(process.cwd(), "app", "[slug]", "content");
}

function isDraftFile(filePath: string): boolean {
	try {
		const content = fs.readFileSync(filePath, "utf8");
		const draftRegex = /^draft:\s*(true|false)$/m;
		const draftMatch = content.match(draftRegex);
		return draftMatch ? draftMatch[1] === "true" : false;
	} catch (error) {
		console.error(`❌ Erro ao ler ${filePath}:`, error);
		return false;
	}
}

function updateMdxDate(filePath: string, newDate: string): void {
	try {
		const content = fs.readFileSync(filePath, "utf8");
		const dateRegex = /^date:\s*["']([^"']+)["']$/m;

		if (!dateRegex.test(content)) {
			console.warn(`⚠️  Data não encontrada no arquivo: ${path.basename(filePath)}`);
			return;
		}

		const updatedContent = content.replace(dateRegex, `date: "${newDate}"`);
		fs.writeFileSync(filePath, updatedContent, "utf8");
		console.log(`✅ Atualizado: ${path.basename(filePath)} -> ${newDate}`);
	} catch (error) {
		console.error(`❌ Erro ao atualizar ${filePath}:`, error);
	}
}

function getAllMdxFiles(contentPath: string): string[] {
	try {
		const files = fs.readdirSync(contentPath);
		return files
			.filter((file) => file.endsWith(".mdx"))
			.map((file) => path.join(contentPath, file))
			.sort();
	} catch (error) {
		console.error(`❌ Erro ao ler diretório ${contentPath}:`, error);
		return [];
	}
}

function getPreviousPostingDay(date: Date): Date {
	const dayOfWeek = date.getDay();
	const newDate = new Date(date);

	if (dayOfWeek === 1) {
		newDate.setDate(newDate.getDate() - 3);
	} else if (dayOfWeek === 3) {
		newDate.setDate(newDate.getDate() - 2);
	} else if (dayOfWeek === 5) {
		newDate.setDate(newDate.getDate() - 2);
	} else if (dayOfWeek === 0) {
		newDate.setDate(newDate.getDate() - 2);
	} else if (dayOfWeek === 2) {
		newDate.setDate(newDate.getDate() - 1);
	} else if (dayOfWeek === 4) {
		newDate.setDate(newDate.getDate() - 1);
	} else if (dayOfWeek === 6) {
		newDate.setDate(newDate.getDate() - 1);
	}

	return newDate;
}

function getLastPostingDay(): Date {
	const now = new Date();
	const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
	const dayOfWeek = brazilTime.getDay();

	const result = new Date(brazilTime.getFullYear(), brazilTime.getMonth(), brazilTime.getDate());

	if (dayOfWeek === 1 || dayOfWeek === 3 || dayOfWeek === 5) {
		return result;
	}

	if (dayOfWeek === 0) {
		result.setDate(result.getDate() - 2);
	} else if (dayOfWeek === 2) {
		result.setDate(result.getDate() - 1);
	} else if (dayOfWeek === 4) {
		result.setDate(result.getDate() - 1);
	} else if (dayOfWeek === 6) {
		result.setDate(result.getDate() - 1);
	}

	return result;
}

function updateDates(): void {
	const now = new Date();
	const brazilTime = new Date(now.toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }));
	const today = new Date(brazilTime.getFullYear(), brazilTime.getMonth(), brazilTime.getDate());
	const daysOfWeek = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];

	console.log(`🚀 Iniciando atualização de datas`);
	console.log(`📅 Hoje é: ${daysOfWeek[today.getDay()]} - ${formatDate(today)}`);
	console.log(`📆 Padrão de postagens: Segunda, Quarta e Sexta-feira`);
	console.log("");

	const contentPath = getContentPath();

	if (!fs.existsSync(contentPath)) {
		throw new Error(`Diretório não encontrado: ${contentPath}`);
	}

	const mdxFiles = getAllMdxFiles(contentPath);

	if (mdxFiles.length === 0) {
		console.log(`⚠️  Nenhum arquivo .mdx encontrado em: ${contentPath}`);
		return;
	}

	console.log(`📂 Encontrados ${mdxFiles.length} arquivos .mdx\n`);

	const draftFiles: string[] = [];
	const publishedFiles: string[] = [];

	mdxFiles.forEach((filePath) => {
		if (isDraftFile(filePath)) {
			draftFiles.push(filePath);
		} else {
			publishedFiles.push(filePath);
		}
	});

	console.log(`📝 Arquivos publicados (draft: false): ${publishedFiles.length}`);
	console.log(`📋 Arquivos rascunho (draft: true): ${draftFiles.length}\n`);

	let currentDate = getLastPostingDay();
	let updatedCount = 0;

	console.log(`🎯 Primeira data: ${formatDate(currentDate)}\n`);

	publishedFiles.forEach((filePath) => {
		const dateString = formatDate(currentDate);
		updateMdxDate(filePath, dateString);
		currentDate = getPreviousPostingDay(currentDate);
		updatedCount++;
	});

	if (draftFiles.length > 0) {
		console.log("\n📋 Arquivos ignorados (draft: true):");
		draftFiles.forEach((filePath) => {
			console.log(`⏭️  ${path.basename(filePath)}`);
		});
	}

	console.log(`\n✨ Finalizado! ${updatedCount} arquivos atualizados, ${draftFiles.length} ignorados.`);
}

function main(): void {
	try {
		updateDates();
	} catch (error) {
		console.error("❌ Erro durante execução:", error);
		process.exit(1);
	}
}

if (require.main === module) {
	main();
}

export { updateDates };
