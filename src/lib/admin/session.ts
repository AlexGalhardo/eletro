// The admin is a set of static pages, so the unlocked token has to survive navigation between them.
// The raw token never touches web storage: at login a non-extractable AES-GCM key is stored in IndexedDB
// and sessionStorage holds only { iv, ciphertext, expires }. A page decrypts in memory when it needs the token.
// Leaving, expiring, a missing key or a failed decryption all mean "no session". This limits what an XSS can
// exfiltrate (the key cannot be exported), not what it can do while the session is open: keep the token
// fine-grained, short and revocable. The guard is UX only; the real protection is the token itself.
const ITEM = "admin-session";
const DB = "admin-session";
const STORE = "keys";
const KEY_ID = "session";
export const SESSION_TTL_MS = 4 * 60 * 60 * 1000;
export const LOGIN_PATH = "/admin/login";

export interface Store {
	getItem(key: string): string | null;
	setItem(key: string, value: string): void;
	removeItem(key: string): void;
}

export interface KeyStore {
	get(): Promise<CryptoKey | undefined>;
	put(key: CryptoKey): Promise<void>;
	delete(): Promise<void>;
}

export interface SessionOptions {
	now?: number;
	storage?: Store | null;
	keys?: KeyStore;
}

function defaultStorage(): Store | null {
	try {
		return globalThis.sessionStorage ?? null;
	} catch {
		return null;
	}
}

function request<T>(req: IDBRequest<T>): Promise<T> {
	return new Promise((resolve, reject) => {
		req.onsuccess = () => resolve(req.result);
		req.onerror = () => reject(req.error);
	});
}

function openDb(): Promise<IDBDatabase> {
	const open = indexedDB.open(DB, 1);
	open.onupgradeneeded = () => open.result.createObjectStore(STORE);
	return request(open);
}

export const indexedDbKeys: KeyStore = {
	async get() {
		const db = await openDb();
		try {
			return (await request(db.transaction(STORE).objectStore(STORE).get(KEY_ID))) as
				| CryptoKey
				| undefined;
		} finally {
			db.close();
		}
	},
	async put(key) {
		const db = await openDb();
		try {
			await request(db.transaction(STORE, "readwrite").objectStore(STORE).put(key, KEY_ID));
		} finally {
			db.close();
		}
	},
	async delete() {
		await new Promise<void>((resolve) => {
			const req = indexedDB.deleteDatabase(DB);
			req.onsuccess = () => resolve();
			req.onerror = () => resolve();
			req.onblocked = () => resolve();
		});
	},
};

const toBase64 = (bytes: Uint8Array): string => btoa(String.fromCharCode(...bytes));
const fromBase64 = (value: string): Uint8Array<ArrayBuffer> =>
	Uint8Array.from(atob(value), (character) => character.charCodeAt(0));

/** Only same-site admin paths are accepted, so `?next=` cannot send the visitor somewhere else. */
export function safeNext(raw: string | null | undefined): string {
	if (!raw?.startsWith("/admin/") || raw.startsWith("/admin//") || /[\\\s]/.test(raw)) return "/admin";
	if (raw === LOGIN_PATH || raw.startsWith(`${LOGIN_PATH}?`) || raw.startsWith(`${LOGIN_PATH}/`))
		return "/admin";
	try {
		const url = new URL(raw, "https://admin.invalid");
		if (url.origin !== "https://admin.invalid" || !url.pathname.startsWith("/admin/")) return "/admin";
	} catch {
		return "/admin";
	}
	return raw;
}

export async function clearSession({
	storage = defaultStorage(),
	keys = indexedDbKeys,
}: SessionOptions = {}): Promise<void> {
	try {
		storage?.removeItem(ITEM);
	} catch {}
	try {
		await keys.delete();
	} catch {}
}

/** Returns false when the browser cannot keep a session (no storage or no WebCrypto/IndexedDB). */
export async function saveSession(
	token: string,
	{ now = Date.now(), storage = defaultStorage(), keys = indexedDbKeys }: SessionOptions = {},
): Promise<boolean> {
	try {
		if (!storage) return false;
		const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
			"encrypt",
			"decrypt",
		]);
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const ciphertext = await crypto.subtle.encrypt(
			{ name: "AES-GCM", iv },
			key,
			new TextEncoder().encode(token),
		);
		await keys.put(key);
		storage.setItem(
			ITEM,
			JSON.stringify({
				iv: toBase64(iv),
				ciphertext: toBase64(new Uint8Array(ciphertext)),
				expires: now + SESSION_TTL_MS,
			}),
		);
		return true;
	} catch {
		await clearSession({ storage, keys });
		return false;
	}
}

/** The token of a valid session, or null when it is missing, expired, undecryptable or corrupted (and then it is dropped). */
export async function readSession({
	now = Date.now(),
	storage = defaultStorage(),
	keys = indexedDbKeys,
}: SessionOptions = {}): Promise<string | null> {
	try {
		const raw = storage?.getItem(ITEM);
		if (!raw) return null;
		const data: unknown = JSON.parse(raw);
		if (
			typeof data === "object" &&
			data !== null &&
			"iv" in data &&
			"ciphertext" in data &&
			"expires" in data &&
			typeof data.iv === "string" &&
			typeof data.ciphertext === "string" &&
			typeof data.expires === "number" &&
			data.expires > now
		) {
			const key = await keys.get();
			if (key) {
				const plain = await crypto.subtle.decrypt(
					{ name: "AES-GCM", iv: fromBase64(data.iv) },
					key,
					fromBase64(data.ciphertext),
				);
				const token = new TextDecoder().decode(plain);
				if (token) return token;
			}
		}
	} catch {}
	await clearSession({ storage, keys });
	return null;
}

/**
 * Runs in the <head> before the page paints: no valid-looking entry redirects at once; otherwise the page stays
 * hidden until the key in IndexedDB decrypts the entry. Mirrors readSession; session.test.ts runs it.
 */
export const GUARD_SCRIPT = `(function(){var h=document.documentElement;function go(){try{sessionStorage.removeItem(${JSON.stringify(ITEM)})}catch(e){}try{indexedDB.deleteDatabase(${JSON.stringify(DB)})}catch(e){}h.style.visibility="hidden";location.replace(${JSON.stringify(`${LOGIN_PATH}?next=`)}+encodeURIComponent(location.pathname.replace(/\\/$/,"")+location.search).replace(/%2F/g,"/"))}var d;try{d=JSON.parse(sessionStorage.getItem(${JSON.stringify(ITEM)}))}catch(e){}if(!d||typeof d.iv!=="string"||typeof d.ciphertext!=="string"||typeof d.expires!=="number"||d.expires<=Date.now())return go();h.style.visibility="hidden";function b(s){return Uint8Array.from(atob(s),function(c){return c.charCodeAt(0)})}try{var o=indexedDB.open(${JSON.stringify(DB)},1);o.onupgradeneeded=function(){o.transaction.abort()};o.onerror=go;o.onsuccess=function(){try{var db=o.result,g=db.transaction(${JSON.stringify(STORE)}).objectStore(${JSON.stringify(STORE)}).get(${JSON.stringify(KEY_ID)});g.onerror=go;g.onsuccess=function(){db.close();if(!g.result)return go();crypto.subtle.decrypt({name:"AES-GCM",iv:b(d.iv)},g.result,b(d.ciphertext)).then(function(){h.style.visibility=""},go)}}catch(e){go()}}}catch(e){go()}})();`;
