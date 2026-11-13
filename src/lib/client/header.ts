import Fuse from "fuse.js";
import { formatDate } from "#lib/format.ts";
import { bindThemeToggles } from "#lib/theme.ts";

export type SearchItem = {
	slug: string;
	title: string;
	date: string;
	cover: string;
	category: string;
};

const normalize = (value: string): string => value.normalize("NFD").replace(/\p{M}/gu, "").toLowerCase();

const ROW =
	"cursor-pointer border-b border-gray-100 p-4 transition-colors duration-150 last:border-b-0 dark:border-zinc-900 ";
const ROW_ON = `${ROW}bg-blue-50 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400`;
const ROW_OFF = `${ROW}text-gray-900 hover:bg-gray-50 dark:text-gray-100 dark:hover:bg-zinc-900`;

const CAT_ON =
	"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors bg-blue-600 text-white";
const CAT_OFF =
	"flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-semibold transition-colors text-gray-800 hover:bg-gray-100 dark:text-gray-100 dark:hover:bg-zinc-900";

function isSearchItem(value: unknown): value is SearchItem {
	if (!value || typeof value !== "object") return false;
	const item = value as Record<string, unknown>;
	return (
		typeof item.slug === "string" &&
		typeof item.title === "string" &&
		typeof item.date === "string" &&
		typeof item.cover === "string" &&
		typeof item.category === "string"
	);
}

export function readSearchIndex(): SearchItem[] {
	const node = document.getElementById("search-index");
	if (!node?.textContent) return [];
	try {
		const value: unknown = JSON.parse(node.textContent);
		return Array.isArray(value) ? value.filter(isSearchItem) : [];
	} catch {
		return [];
	}
}

function suggestion(
	post: SearchItem,
	index: number,
	selected: boolean,
	choose: (post: SearchItem) => void,
): HTMLElement {
	const row = document.createElement("div");
	row.role = "option";
	row.tabIndex = -1;
	row.dataset.suggestion = String(index);
	row.setAttribute("aria-selected", selected ? "true" : "false");
	row.className = selected ? ROW_ON : ROW_OFF;
	row.addEventListener("mousedown", (event) => {
		event.preventDefault();
		choose(post);
	});

	const wrap = document.createElement("div");
	wrap.className = "flex items-center gap-3";
	if (post.cover) {
		const img = document.createElement("img");
		img.src = post.cover;
		img.alt = "";
		img.loading = "lazy";
		img.decoding = "async";
		img.className = "aspect-video w-20 shrink-0 rounded bg-gray-100 object-cover dark:bg-zinc-900";
		wrap.append(img);
	}
	const text = document.createElement("div");
	text.className = "min-w-0";
	const title = document.createElement("div");
	title.className = "line-clamp-1 text-sm font-medium";
	title.textContent = post.title;
	const time = document.createElement("time");
	time.dateTime = post.date;
	time.className = "text-xs text-gray-500 dark:text-gray-400";
	time.textContent = formatDate(post.date);
	text.append(title, time);
	wrap.append(text);
	row.append(wrap);
	return row;
}

function reveal(root: HTMLElement, index: number): void {
	const option = root.querySelector<HTMLElement>(`[data-suggestion="${index}"]`);
	const list = option?.parentElement;
	if (!option || !list) return;
	const top = option.offsetTop;
	const bottom = top + option.offsetHeight;
	if (top < list.scrollTop) list.scrollTop = top;
	else if (bottom > list.scrollTop + list.clientHeight) list.scrollTop = bottom - list.clientHeight;
}

/** Search, mobile menu and theme toggle in the public header. */
export function initHeader(posts: SearchItem[]): void {
	bindThemeToggles();

	const fuse = new Fuse(
		posts.map((post) => ({ ...post, normalized: normalize(post.title) })),
		{ keys: ["normalized"], threshold: 0.4, distance: 200, ignoreLocation: true },
	);
	const roots = [...document.querySelectorAll<HTMLElement>("[data-search]")];
	const mobile = document.querySelector<HTMLElement>("[data-mobile-search]");
	const openIcon = document.querySelector<HTMLElement>("[data-search-open-icon]");
	const closeIcon = document.querySelector<HTMLElement>("[data-search-close-icon]");
	let term = "";
	let selected = -1;
	let open = false;

	const found = (): SearchItem[] =>
		term.length >= 2
			? fuse
					.search(normalize(term).trim())
					.slice(0, 6)
					.map((result) => result.item)
			: [];

	function choose(post: SearchItem): void {
		open = false;
		term = "";
		selected = -1;
		if (mobile) mobile.hidden = true;
		syncSearchIcons();
		location.assign(`/${post.slug}`);
	}

	function render(): void {
		const items = found();
		open = items.length > 0 && term.length >= 3;
		for (const root of roots) {
			const input = root.querySelector("input");
			if (input && input.value !== term) input.value = term;
			let list = root.querySelector<HTMLElement>("[data-suggestions]");
			if (!open) {
				list?.remove();
				continue;
			}
			if (!list) {
				list = document.createElement("div");
				list.dataset.suggestions = "";
				list.className =
					"absolute top-full right-0 left-0 z-50 mt-2 max-h-[calc(100vh-6rem)] overflow-y-auto rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-zinc-800 dark:bg-zinc-950";
				list.setAttribute("role", "listbox");
				root.append(list);
			}
			list.replaceChildren(
				...items.map((post, index) => suggestion(post, index, index === selected, choose)),
			);
		}
	}

	function onKeydown(event: KeyboardEvent): void {
		if (event.key === "Escape") {
			open = false;
			selected = -1;
			if (mobile) mobile.hidden = true;
			syncSearchIcons();
			render();
			return;
		}
		const items = found();
		if (!open || items.length === 0) return;
		const root = (event.currentTarget as HTMLElement | null)?.closest<HTMLElement>("[data-search]");
		if (event.key === "ArrowDown") {
			event.preventDefault();
			selected = selected < items.length - 1 ? selected + 1 : 0;
			render();
			if (root) reveal(root, selected);
		} else if (event.key === "ArrowUp") {
			event.preventDefault();
			selected = selected > 0 ? selected - 1 : items.length - 1;
			render();
			if (root) reveal(root, selected);
		} else if (event.key === "Enter") {
			event.preventDefault();
			const post = items[selected];
			if (post) choose(post);
		}
	}

	for (const root of roots) {
		const input = root.querySelector("input");
		if (!input) continue;
		input.addEventListener("input", () => {
			term = input.value;
			selected = -1;
			render();
		});
		input.addEventListener("keydown", onKeydown);
		input.addEventListener("focus", () => {
			input.select();
			if (term.length >= 3 && found().length > 0) {
				open = true;
				render();
			}
		});
	}

	document.addEventListener("mousedown", (event) => {
		const target = event.target;
		if (!(target instanceof Element) || !target.closest("[data-search]")) {
			open = false;
			selected = -1;
			render();
		}
	});

	function syncSearchIcons(): void {
		const shown = mobile ? !mobile.hidden : false;
		if (openIcon) openIcon.hidden = shown;
		if (closeIcon) closeIcon.hidden = !shown;
	}

	document.querySelector("[data-search-toggle]")?.addEventListener("click", () => {
		if (!mobile) return;
		mobile.hidden = !mobile.hidden;
		syncSearchIcons();
		if (!mobile.hidden) mobile.querySelector("input")?.focus();
	});

	const sidebar = document.querySelector<HTMLElement>("[data-sidebar]");
	const backdrop = document.querySelector<HTMLElement>("[data-sidebar-backdrop]");

	function currentCategory(): string {
		const url = new URL(window.location.href);
		return url.pathname === "/" ? (url.searchParams.get("categoria") ?? "all") : "";
	}

	function paintSidebar(): void {
		const current = currentCategory();
		for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-nav]")) {
			const on = link.dataset.nav === current;
			link.className = on ? CAT_ON : CAT_OFF;
			link.setAttribute("aria-current", on ? "page" : "false");
			if (!on) link.removeAttribute("aria-current");
			const icon = link.querySelector<HTMLElement>("[data-cat-icon]");
			if (icon) icon.className = on ? "h-5 w-5" : "h-5 w-5 text-blue-600 dark:text-blue-500";
		}
	}

	function setSidebar(shown: boolean): void {
		if (sidebar) sidebar.hidden = !shown;
		if (backdrop) backdrop.hidden = !shown;
		document.body.style.overflow = shown ? "hidden" : "";
		if (shown) paintSidebar();
	}

	document.querySelector("[data-open-menu]")?.addEventListener("click", () => setSidebar(true));
	for (const button of document.querySelectorAll("[data-close-menu]")) {
		button.addEventListener("click", () => setSidebar(false));
	}
	window.addEventListener("keydown", (event) => {
		if (event.key === "Escape" && sidebar && !sidebar.hidden) setSidebar(false);
	});
}
