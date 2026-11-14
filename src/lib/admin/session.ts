// The admin is a set of static pages, so the unlocked token has to survive navigation between them.
// sessionStorage is scoped to the tab and disappears when it closes; the entry also expires on its own.
// The guard is UX only: the real protection is the GitHub token, and no admin page carries a secret.
const KEY = "admin-session";
export const SESSION_TTL_MS = 8 * 60 * 60 * 1000;
export const LOGIN_PATH = "/admin/login";

type Store = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function defaultStore(): Store | null {
	try {
		return globalThis.sessionStorage ?? null;
	} catch {
		return null;
	}
}

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

export function saveSession(token: string, now = Date.now(), store: Store | null = defaultStore()): void {
	try {
		store?.setItem(KEY, JSON.stringify({ token, expires: now + SESSION_TTL_MS }));
	} catch {}
}

/** The token of a valid session, or null when it is missing, corrupted or expired (an invalid entry is dropped). */
export function readSession(now = Date.now(), store: Store | null = defaultStore()): string | null {
	try {
		const raw = store?.getItem(KEY);
		if (!raw) return null;
		const data: unknown = JSON.parse(raw);
		if (
			typeof data === "object" &&
			data !== null &&
			"token" in data &&
			"expires" in data &&
			typeof data.token === "string" &&
			data.token !== "" &&
			typeof data.expires === "number" &&
			data.expires > now
		)
			return data.token;
		store?.removeItem(KEY);
	} catch {
		try {
			store?.removeItem(KEY);
		} catch {}
	}
	return null;
}

export function clearSession(store: Store | null = defaultStore()): void {
	try {
		store?.removeItem(KEY);
	} catch {}
}

/** Runs in the <head> before the page paints. Mirrors readSession; session.test.ts runs it against it. */
export const GUARD_SCRIPT = `(function(){var ok=false;try{var d=JSON.parse(sessionStorage.getItem(${JSON.stringify(KEY)}));ok=!!d&&typeof d.token==="string"&&d.token!==""&&typeof d.expires==="number"&&d.expires>Date.now()}catch(e){}if(!ok){document.documentElement.style.visibility="hidden";location.replace(${JSON.stringify(`${LOGIN_PATH}?next=`)}+encodeURIComponent(location.pathname.replace(/\\/$/,"")+location.search).replace(/%2F/g,"/"))}})();`;
