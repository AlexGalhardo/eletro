import fs from "node:fs";
import path from "node:path";

const staticUrls: string[] = [
	"https://example.com",
	"https://example.com/contato",
	"https://example.com/politica-de-privacidade",
	"https://example.com/termos-de-uso",
	"https://example.com/sobre",
];

function generateIndexNowFile(): void {
	const contentDir = path.join(process.cwd(), "app", "[slug]", "content");
	const contentUrls: string[] = [];

	if (!fs.existsSync(contentDir)) {
		console.error(`Error: Content directory not found at ${contentDir}`);
		return;
	}

	const files = fs.readdirSync(contentDir);

	files.forEach((file) => {
		if (file.endsWith(".mdx")) {
			const slug = file.replace(".mdx", "");
			contentUrls.push(`https://example.com/${slug}`);
		}
	});

	const allUrls = [...staticUrls, ...contentUrls];

	const urlListJson = allUrls.map((url) => `\t\t"${url}"`).join(",\n");

	const httpRequest = `POST https://api.indexnow.org/IndexNow HTTP/1.1
Content-Type: application/json; charset=utf-8

{
\t"host": "https://example.com",
\t"key": "7252d624f35841dba0dccb389f4985c1",
\t"keyLocation": "https://example.com/7252d624f35841dba0dccb389f4985c1.txt",
\t"urlList": [
${urlListJson}
\t]
}`;

	const apiDir = path.join(process.cwd(), "api");
	if (!fs.existsSync(apiDir)) {
		fs.mkdirSync(apiDir, { recursive: true });
	}

	const outputPath = path.join(apiDir, "indexnow.http");
	fs.writeFileSync(outputPath, httpRequest, "utf-8");

	console.log(`✅ IndexNow file generated successfully!`);
	console.log(`📊 Total URLs: ${allUrls.length}`);
	console.log(`   - Static URLs: ${staticUrls.length}`);
	console.log(`   - Content URLs: ${contentUrls.length}`);
	console.log(`📁 Location: ${outputPath}`);
}

generateIndexNowFile();
