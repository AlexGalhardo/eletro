import { isDashboardUp } from "#lib/affiliate-links.ts";
import { browserFlag } from "#lib/flags.ts";
import { site } from "#lib/site.config.ts";

function shuffle(table: HTMLElement): void {
	const cards = [...table.children];
	for (let i = cards.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		const current = cards[i];
		const swap = cards[j];
		if (!current || !swap) continue;
		cards[i] = swap;
		cards[j] = current;
	}
	table.replaceChildren(...cards);
}

/** Shuffles product cards and points store buttons at the store when the links dashboard is down. */
export function initCards(): void {
	for (const table of document.querySelectorAll<HTMLElement>("[data-cards]")) {
		if (table.dataset.shuffle !== "false") shuffle(table);
	}
	if (browserFlag("allStoreButtons")) {
		for (const extra of document.querySelectorAll<HTMLElement>("[data-extra-store]"))
			extra.hidden = false;
	}
	void isDashboardUp(site.linksDashboardUrl).then((up) => {
		if (up) return;
		for (const link of document.querySelectorAll<HTMLAnchorElement>("[data-direct-href]")) {
			const direct = link.dataset.directHref;
			if (direct) link.href = direct;
		}
	});
}
