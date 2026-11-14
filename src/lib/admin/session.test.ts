import { describe, expect, test } from "vitest";
import {
	clearSession,
	GUARD_SCRIPT,
	type KeyStore,
	readSession,
	SESSION_TTL_MS,
	safeNext,
	saveSession,
} from "./session.ts";

function memory(initial: Record<string, string> = {}) {
	const data = new Map(Object.entries(initial));
	return {
		getItem: (key: string) => data.get(key) ?? null,
		setItem: (key: string, value: string) => void data.set(key, value),
		removeItem: (key: string) => void data.delete(key),
		data,
	};
}

describe("safeNext", () => {
	test.each([
		["/admin/flags", "/admin/flags"],
		["/admin/posts?x=1", "/admin/posts?x=1"],
		[null, "/admin"],
		["", "/admin"],
		["/admin", "/admin"],
		["/other", "/admin"],
		["https://evil.example/admin/x", "/admin"],
		["//evil.example/admin/x", "/admin"],
		["/admin//evil.example", "/admin"],
		["/admin/\\evil.example", "/admin"],
		["/admin/login", "/admin"],
		["/admin/login?next=/admin/flags", "/admin"],
		["javascript:alert(1)", "/admin"],
	])("%s -> %s", (raw, expected) => {
		expect(safeNext(raw)).toBe(expected);
	});
});

function memoryKeys(): KeyStore & { key?: CryptoKey } {
	const store: KeyStore & { key?: CryptoKey } = {
		get: async () => store.key,
		put: async (key) => {
			store.key = key;
		},
		delete: async () => {
			store.key = undefined;
		},
	};
	return store;
}

describe("session", () => {
	const now = 1_000_000;
	const setup = () => ({ storage: memory(), keys: memoryKeys() });

	test("keeps no raw token in web storage and the key is not extractable", async () => {
		const ctx = setup();
		expect(await saveSession("ghp_secret", { now, ...ctx })).toBe(true);
		const stored = ctx.storage.data.get("admin-session") ?? "";
		expect(stored).not.toContain("ghp_secret");
		expect(Object.keys(JSON.parse(stored)).sort()).toEqual(["ciphertext", "expires", "iv"]);
		expect(ctx.keys.key?.extractable).toBe(false);
		await expect(crypto.subtle.exportKey("raw", ctx.keys.key as CryptoKey)).rejects.toThrow();
	});

	test("decrypts the token while valid and drops everything at the expiry", async () => {
		const ctx = setup();
		await saveSession("tok", { now, ...ctx });
		expect(await readSession({ now: now + SESSION_TTL_MS - 1, ...ctx })).toBe("tok");
		expect(await readSession({ now: now + SESSION_TTL_MS, ...ctx })).toBeNull();
		expect(ctx.storage.data.size).toBe(0);
		expect(ctx.keys.key).toBeUndefined();
	});

	test("the session lasts four hours", () => {
		expect(SESSION_TTL_MS).toBe(4 * 60 * 60 * 1000);
	});

	test("is null when absent", async () => {
		expect(await readSession({ now, ...setup() })).toBeNull();
	});

	test("a missing key means no session", async () => {
		const ctx = setup();
		await saveSession("tok", { now, ...ctx });
		ctx.keys.key = undefined;
		expect(await readSession({ now, ...ctx })).toBeNull();
		expect(ctx.storage.data.size).toBe(0);
	});

	test("a key that cannot decrypt means no session", async () => {
		const ctx = setup();
		await saveSession("tok", { now, ...ctx });
		ctx.keys.key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["decrypt"]);
		expect(await readSession({ now, ...ctx })).toBeNull();
		expect(ctx.storage.data.size).toBe(0);
	});

	test.each([
		"not json",
		"null",
		'{"iv":"a"}',
		'{"iv":1,"ciphertext":"b","expires":9999999999999}',
		'{"iv":"!!","ciphertext":"??","expires":9999999999999}',
	])("drops a corrupted entry: %s", async (raw) => {
		const ctx = setup();
		ctx.storage.data.set("admin-session", raw);
		expect(await readSession({ now, ...ctx })).toBeNull();
		expect(ctx.storage.data.size).toBe(0);
	});

	test("clearSession removes the item and the key", async () => {
		const ctx = setup();
		await saveSession("tok", { now, ...ctx });
		await clearSession(ctx);
		expect(ctx.storage.data.size).toBe(0);
		expect(ctx.keys.key).toBeUndefined();
		expect(await readSession({ now, ...ctx })).toBeNull();
	});

	test("never throws when storage is blocked", async () => {
		const blocked = {
			getItem: () => {
				throw new Error("denied");
			},
			setItem: () => {
				throw new Error("denied");
			},
			removeItem: () => {
				throw new Error("denied");
			},
		};
		const keys = memoryKeys();
		expect(await saveSession("t", { now, storage: blocked, keys })).toBe(false);
		expect(await readSession({ now, storage: blocked, keys })).toBeNull();
		await expect(clearSession({ storage: blocked, keys })).resolves.toBeUndefined();
		expect(await saveSession("t", { now, storage: null, keys })).toBe(false);
	});
});

describe("GUARD_SCRIPT", () => {
	async function sealed(expires = Date.now() + 60_000) {
		const key = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, [
			"encrypt",
			"decrypt",
		]);
		const iv = crypto.getRandomValues(new Uint8Array(12));
		const data = new Uint8Array(
			await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new Uint8Array([1])),
		);
		const b64 = (bytes: Uint8Array) => btoa(String.fromCharCode(...bytes));
		return { key, item: JSON.stringify({ iv: b64(iv), ciphertext: b64(data), expires }) };
	}

	function run(stored: string | null, key: CryptoKey | undefined, path = "/admin/flags") {
		const replaced: string[] = [];
		const style = { visibility: "" };
		const removed: string[] = [];
		const request = <T>(result: T) => {
			const req: { result: T; onsuccess?: () => void } = { result };
			queueMicrotask(() => req.onsuccess?.());
			return req;
		};
		const indexedDB = {
			deleteDatabase: () => undefined,
			open: () => {
				const req: { result: unknown; onsuccess?: () => void; onerror?: () => void } = {
					result: {
						close: () => undefined,
						transaction: () => ({ objectStore: () => ({ get: () => request(key) }) }),
					},
				};
				queueMicrotask(() => req.onsuccess?.());
				return req;
			},
		};
		new Function(
			"sessionStorage",
			"indexedDB",
			"crypto",
			"document",
			"location",
			"encodeURIComponent",
			GUARD_SCRIPT,
		)(
			{ getItem: () => stored, removeItem: (k: string) => removed.push(k) },
			indexedDB,
			crypto,
			{ documentElement: { style } },
			{ pathname: path, search: "", replace: (url: string) => replaced.push(url) },
			encodeURIComponent,
		);
		return { replaced, style, removed };
	}

	const settle = () => new Promise((resolve) => setTimeout(resolve, 20));

	test("without a session, hides the page and redirects with the requested route", () => {
		const out = run(null, undefined);
		expect(out.replaced).toEqual(["/admin/login?next=/admin/flags"]);
		expect(out.style.visibility).toBe("hidden");
		expect(run("garbage", undefined, "/admin/posts/").replaced).toEqual([
			"/admin/login?next=/admin/posts",
		]);
	});

	test("redirects when expired", async () => {
		const { item, key } = await sealed(1);
		expect(run(item, key).replaced).toHaveLength(1);
	});

	test("redirects when the key is missing", async () => {
		const { item } = await sealed();
		const out = run(item, undefined);
		await settle();
		expect(out.replaced).toHaveLength(1);
		expect(out.removed).toEqual(["admin-session"]);
	});

	test("redirects when the key cannot decrypt", async () => {
		const { item } = await sealed();
		const other = await crypto.subtle.generateKey({ name: "AES-GCM", length: 256 }, false, ["decrypt"]);
		const out = run(item, other);
		await settle();
		expect(out.replaced).toHaveLength(1);
	});

	test("reveals the page for a valid session", async () => {
		const { item, key } = await sealed();
		const out = run(item, key);
		expect(out.style.visibility).toBe("hidden");
		await settle();
		expect(out.replaced).toEqual([]);
		expect(out.style.visibility).toBe("");
	});
});
