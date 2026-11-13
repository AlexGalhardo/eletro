import { writeFile } from "node:fs/promises";
import { sealCredential } from "../src/lib/admin/credential.ts";

const token = process.env.ADMIN_GITHUB_TOKEN;
const password = process.env.ADMIN_PASSWORD;

if (token || password) {
	if (!token || !password) throw new Error("Configure ADMIN_GITHUB_TOKEN e ADMIN_PASSWORD juntos.");
	const payload = await sealCredential(token, password);
	await writeFile("dist/admin-credential.json", JSON.stringify(payload));
	console.info("Credencial do painel criptografada para publicação.");
}
