const PER_LOAD = 8;

const BASE =
	"flex w-full cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold tracking-wide uppercase transition-colors duration-200 ";
const ON = "border-blue-600 bg-blue-600 text-white";
const OFF =
	"border-gray-200 text-gray-600 hover:border-blue-500 hover:text-blue-600 dark:border-zinc-700 dark:text-gray-300 dark:hover:text-blue-400";

/** Category filter and the "load more" sentinel on the home page. */
export function initHome(): void {
	const root = document.querySelector<HTMLElement>("[data-home]");
	if (!root) return;

	const buttons = [...root.querySelectorAll<HTMLButtonElement>("[data-filter]")];
	const cards = [...root.querySelectorAll<HTMLElement>("[data-post]")];
	const empty = root.querySelector<HTMLElement>("[data-empty]");
	const banner = root.querySelector<HTMLElement>("[data-filter-banner]");
	const bannerName = root.querySelector<HTMLElement>("[data-filter-name]");
	const sentinel = root.querySelector<HTMLElement>("[data-sentinel]");

	let selected = "all";
	let visibleCount = PER_LOAD;
	const fromUrl = new URL(window.location.href).searchParams.get("categoria");
	if (fromUrl && buttons.some((button) => button.dataset.filter === fromUrl)) selected = fromUrl;

	const filtered = (): HTMLElement[] =>
		selected === "all" ? cards : cards.filter((card) => card.dataset.category === selected);

	function paint(): void {
		const list = filtered();
		for (const card of cards) card.hidden = true;
		for (const card of list.slice(0, visibleCount)) card.hidden = false;
		if (empty) empty.hidden = list.length > 0;
		if (banner) banner.hidden = selected === "all";
		if (bannerName) {
			bannerName.textContent =
				buttons.find((button) => button.dataset.filter === selected)?.dataset.label ?? "";
		}
		for (const button of buttons) {
			const on = button.dataset.filter === selected;
			button.setAttribute("aria-pressed", String(on));
			button.className = BASE + (on ? ON : OFF);
		}
	}

	function select(id: string): void {
		selected = id;
		visibleCount = PER_LOAD;
		paint();
	}

	for (const button of buttons) {
		button.addEventListener("click", () => select(button.dataset.filter ?? "all"));
	}
	root.querySelector("[data-filter-clear]")?.addEventListener("click", () => select("all"));

	if (sentinel) {
		const observer = new IntersectionObserver(
			(entries) => {
				if (entries[0]?.isIntersecting && visibleCount < filtered().length) {
					visibleCount += PER_LOAD;
					paint();
				}
			},
			// A jump to the end of the page (End key) leaves the sentinel above the viewport, behind the footer.
			{ rootMargin: "2000px 0px 100px 0px" },
		);
		observer.observe(sentinel);
	}

	paint();
}
