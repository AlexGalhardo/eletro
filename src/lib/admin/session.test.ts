import { describe, expect, test } from "vitest";
import { clearSession, GUARD_SCRIPT, readSession, SESSION_TTL_MS, safeNext, saveSession } from "./session.ts";

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

describe("session", () => {
	const now = 1_000_000;

	test("returns the token while valid and nothing after the expiry", () => {
		const store = memory();
		saveSession("tok", now, store);
		expect(readSession(now + SESSION_TTL_MS - 1, store)).toBe("tok");
		expect(readSession(now + SESSION_TTL_MS, store)).toBeNull();
		expect(store.data.size).toBe(0);
	});

	test("is null when absent", () => {
		expect(readSession(now, memory())).toBeNull();
	});

	test.each([
		"not json",
		"null",
		'{"token":"t"}',
		'{"token":"","expires":9999999999999}',
		'{"token":1,"expires":9999999999999}',
	])("drops a corrupted entry: %s", (raw) => {
		const store = memory({ "admin-session": raw });
		expect(readSession(now, store)).toBeNull();
		expect(store.data.size).toBe(0);
	});

	test("clearSession removes it", () => {
		const store = memory();
		saveSession("tok", now, store);
		clearSession(store);
		expect(readSession(now, store)).toBeNull();
	});

	test("never throws when storage is blocked", () => {
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
		expect(() => saveSession("t", now, blocked)).not.toThrow();
		expect(readSession(now, blocked)).toBeNull();
		expect(() => clearSession(blocked)).not.toThrow();
		expect(readSession(now, null)).toBeNull();
	});
});

describe("GUARD_SCRIPT", () => {
	function run(stored: string | null, path = "/admin/flags", search = "") {
		const replaced: string[] = [];
		const style = { visibility: "" };
		new Function("sessionStorage", "document", "location", "encodeURIComponent", GUARD_SCRIPT)(
			{ getItem: () => stored },
			{ documentElement: { style } },
			{ pathname: path, search, replace: (url: string) => replaced.push(url) },
			encodeURIComponent,
		);
		return { replaced, hidden: style.visibility === "hidden" };
	}

	test("redirects to the login with the requested route and hides the page", () => {
		expect(run(null)).toEqual({ replaced: ["/admin/login?next=/admin/flags"], hidden: true });
		expect(run("garbage", "/admin/posts/")).toMatchObject({
			replaced: ["/admin/login?next=/admin/posts"],
		});
	});

	test("redirects when expired", () => {
		expect(run(JSON.stringify({ token: "t", expires: 1 })).replaced).toHaveLength(1);
	});

	test("lets a valid session through", () => {
		expect(run(JSON.stringify({ token: "t", expires: Date.now() + 60_000 }))).toEqual({
			replaced: [],
			hidden: false,
		});
	});
});
