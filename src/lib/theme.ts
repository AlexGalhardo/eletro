const STORAGE_KEY = "theme-preference";

/** Light/dark theme, persisted in localStorage and mirrored as the `dark` class on <html>. */
export function toggleTheme(): void {
	const dark = !document.documentElement.classList.contains("dark");
	document.documentElement.classList.toggle("dark", dark);
	try {
		localStorage.setItem(STORAGE_KEY, dark ? "dark" : "light");
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
