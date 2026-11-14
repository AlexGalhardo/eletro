declare global {
	interface Window {
		gtag?: (command: "event", name: string, params: Record<string, string>) => void;
	}
}

/** Sends a GA4 `affiliate_click` event for every click on an element marked `data-affiliate`. */
export function trackAffiliateClicks(): void {
	document.addEventListener("click", (event) => {
		if (!(event.target instanceof Element)) return;
		const link = event.target.closest<HTMLElement>("[data-affiliate]");
		if (!link || typeof window.gtag !== "function") return;
		window.gtag("event", "affiliate_click", {
			product_id: link.dataset.productId ?? "",
			post_slug: link.dataset.postSlug ?? "",
			store: link.dataset.store ?? "",
		});
	});
}
