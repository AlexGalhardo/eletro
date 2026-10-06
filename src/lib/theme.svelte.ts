const STORAGE_KEY = "theme-preference";

/** Light/dark theme, persisted in localStorage and mirrored as the `dark` class on <html>. */
export const theme = $state({ dark: false });

/** Reads the class set by the inline script in app.html. Call once on mount. */
export function syncTheme() {
	theme.dark = document.documentElement.classList.contains("dark");
}

export function toggleTheme() {
	theme.dark = !theme.dark;
	document.documentElement.classList.toggle("dark", theme.dark);
	try {
		localStorage.setItem(STORAGE_KEY, theme.dark ? "dark" : "light");
	} catch {
		// Storage can be unavailable (private mode); the theme still applies for this visit.
	}
}
