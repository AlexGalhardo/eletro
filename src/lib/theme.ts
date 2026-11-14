const STORAGE_KEY = "theme-preference";
const query = "(prefers-color-scheme: dark)";

/** Light/dark follows the system until the reader overrides it; the choice mirrors as the `dark` class on <html>. */
export function toggleTheme(): void {
	const system = matchMedia(query).matches;
	const target = !document.documentElement.classList.contains("dark");
	document.documentElement.classList.toggle("dark", target);
	try {
		// Pinning the system value would freeze the page against later OS changes, so it clears the override instead.
		if (target === system) localStorage.removeItem(STORAGE_KEY);
		else localStorage.setItem(STORAGE_KEY, target ? "dark" : "light");
	} catch {
		// Storage can be unavailable (private mode); the theme still applies for this visit.
	}
}

/** Binds every `[data-theme-toggle]` button. The boot script in the layout paints the class first. */
export function bindThemeToggles(root: ParentNode = document): void {
	for (const button of root.querySelectorAll<HTMLButtonElement>("[data-theme-toggle]")) {
		if (button.dataset.bound === "theme") continue;
		button.dataset.bound = "theme";
		button.addEventListener("click", () => toggleTheme());
	}
}
