import { test as base } from "@playwright/test";

/**
 * Clarity and Google Tag Manager are real production tags. A blocked or hung request
 * keeps `load` and `networkidle` from ever firing, so the suite drops them.
 */
export const test = base.extend({
	page: async ({ page }, use) => {
		await page.route(/googletagmanager\.com|google-analytics\.com|clarity\.ms/, (route) => route.abort());
		await use(page);
	},
});

export { expect } from "@playwright/test";
