export interface SealedCredential {
	version: 1;
	salt: string;
	iv: string;
	ciphertext: string;
}

const iterations = 600_000;

function encode(bytes: Uint8Array): string {
	return btoa(String.fromCharCode(...bytes));
}

function decode(value: string, length?: number): Uint8Array<ArrayBuffer> {
	if (!/^[A-Za-z0-9+/]+={0,2}$/.test(value)) throw new Error("Invalid credential data");
	const bytes = Uint8Array.from(atob(value), (character) => character.charCodeAt(0));
	if (length && bytes.length !== length) throw new Error("Invalid credential data");
	return bytes;
}

async function key(password: string, salt: Uint8Array<ArrayBuffer>): Promise<CryptoKey> {
	const material = await crypto.subtle.importKey(
		"raw",
		new TextEncoder().encode(password),
		"PBKDF2",
		false,
		["deriveKey"],
	);
	return crypto.subtle.deriveKey(
		{ name: "PBKDF2", hash: "SHA-256", salt, iterations },
		material,
		{ name: "AES-GCM", length: 256 },
		false,
		["encrypt", "decrypt"],
	);
}

export async function sealCredential(token: string, password: string): Promise<SealedCredential> {
	if (!token.trim() || password.length < 20) throw new Error("A senha deve ter pelo menos 20 caracteres.");
	const salt = crypto.getRandomValues(new Uint8Array(16));
	const iv = crypto.getRandomValues(new Uint8Array(12));
	const ciphertext = await crypto.subtle.encrypt(
		{ name: "AES-GCM", iv },
		await key(password, salt),
		new TextEncoder().encode(token.trim()),
	);
	return { version: 1, salt: encode(salt), iv: encode(iv), ciphertext: encode(new Uint8Array(ciphertext)) };
}

export async function openCredential(payload: SealedCredential, password: string): Promise<string> {
	if (payload.version !== 1) throw new Error("Invalid credential version");
	const plaintext = await crypto.subtle.decrypt(
		{ name: "AES-GCM", iv: decode(payload.iv, 12) },
		await key(password, decode(payload.salt, 16)),
		decode(payload.ciphertext),
	);
	return new TextDecoder().decode(plaintext);
}
