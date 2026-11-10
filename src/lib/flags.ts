// Feature flags for a static site. `content/flags.json` is committed and read at build time; the browser flags
// can be overridden per browser on /admin/flags (localStorage). GitHub Pages has no login, so a browser flag
// only changes what this browser shows: never put anything secret behind one.
import raw from "../../content/flags.json";

export const flagDefaults = {
	/** Build flag: drafts and scheduled posts get a noindex page at /preview/<slug>. */
	previewDrafts: raw.previewDrafts === true,
	/** Browser flag: product cards show the three store buttons even when a link is still "#". */
	allStoreButtons: raw.allStoreButtons === true,
};

export const BROWSER_FLAGS = {
	allStoreButtons: "Mostrar os 3 botões de loja (Mercado Livre, Shopee, Amazon) mesmo sem link real",
} as const;
export type BrowserFlag = keyof typeof BROWSER_FLAGS;

const STORAGE_KEY = "flags";

function overrides(): Partial<Record<BrowserFlag, boolean>> {
	try {
		const value: unknown = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? "{}");
		return value && typeof value === "object" ? value : {};
	} catch {
		// No storage (private window, blocked site data) or a hand-edited value: fall back to the defaults.
		return {};
	}
}

/** Browser only: the override saved on /admin/flags, or the committed default. */
export function browserFlag(name: BrowserFlag): boolean {
	const value = overrides()[name];
	return typeof value === "boolean" ? value : flagDefaults[name];
}

export function setBrowserFlag(name: BrowserFlag, value: boolean): void {
	try {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...overrides(), [name]: value }));
	} catch {
		// Storage unavailable: the toggle simply does not persist.
	}
}
