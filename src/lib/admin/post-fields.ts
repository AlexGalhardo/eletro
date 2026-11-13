const frontmatter = /^---\r?\n([\s\S]*?)\r?\n---/;
const fields = ["title", "description", "date", "category", "cover", "draft", "author"] as const;

export type PostField = (typeof fields)[number];

export function postField(raw: string, field: PostField): string {
	const block = frontmatter.exec(raw)?.[1];
	const value = block
		?.split(/\r?\n/)
		.find((line) => line.startsWith(`${field}:`))
		?.slice(field.length + 1)
		.trim();
	if (!value) return "";
	if (value.startsWith('"')) {
		try {
			return String(JSON.parse(value));
		} catch {
			return value.slice(1, -1);
		}
	}
	return value;
}

export function setPostField(raw: string, field: PostField, value: string): string {
	const match = frontmatter.exec(raw);
	if (!match) return raw;
	const encoded = field === "draft" ? String(value === "true") : JSON.stringify(value);
	const lines = (match[1] ?? "").split(/\r?\n/);
	const index = lines.findIndex((line) => line.startsWith(`${field}:`));
	if (index >= 0) lines[index] = `${field}: ${encoded}`;
	else lines.push(`${field}: ${encoded}`);
	return raw.replace(frontmatter, `---\n${lines.join("\n")}\n---`);
}

export function linkedProducts(raw: string): string[] {
	return [
		...new Set(
			[...raw.matchAll(/<CardsTable\s+list="([a-z0-9-]+)"/g)].map((match) => match[1] as string),
		),
	];
}

export function contentImages(raw: string): string[] {
	return [
		...new Set(
			[
				...raw.matchAll(
					/(\/images\/[A-Za-z0-9/_.-]+\.(?:jpe?g|png|webp)|https:\/\/[^"'\s)]+\.(?:jpe?g|png|webp))/gi,
				),
			].map((match) => match[1] as string),
		),
	];
}
