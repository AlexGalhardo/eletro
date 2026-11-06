/**
 * Stand-in for `$app/state`. On the client, `page.url` is the real address (category filters, login errors).
 * During the static build there is no request URL, so callers that need it receive the production origin.
 */
function currentUrl(): URL {
	if (typeof window !== "undefined") return new URL(window.location.href);
	return new URL("https://eletroradar.com.br/");
}

export const page = {
	get url() {
		return currentUrl();
	},
	status: 404,
	error: { message: "Página Não Encontrada" },
	data: {} as { activeCategories?: string[] },
};

/** Full page loads replace SvelteKit client navigations, so the bar never has a pending target. */
export const navigating = { to: null as string | null };
