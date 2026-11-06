import { analyticsReport, googleCredentials, REPORT_DAYS, searchConsoleReport } from "#lib/server/google.ts";
import {
	GOOGLE_ANALYTICS_PROPERTY_ID,
	GOOGLE_SEARCH_CONSOLE_SITE,
	GOOGLE_SERVICE_ACCOUNT_EMAIL,
	GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY,
} from "$app/env/private";

// One report failing (a missing permission, usually) must not hide the other.
const settle = <T>(report: Promise<T>) =>
	report.then(
		(data) => ({ data, error: null }),
		(cause: unknown) => {
			console.error("[google] report failed", cause);
			return { data: null, error: cause instanceof Error ? cause.message : "Erro inesperado." };
		},
	);

export async function load() {
	const credentials = googleCredentials(GOOGLE_SERVICE_ACCOUNT_EMAIL, GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
	const missing = [
		!GOOGLE_SERVICE_ACCOUNT_EMAIL && "GOOGLE_SERVICE_ACCOUNT_EMAIL",
		!GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY && "GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY",
		!GOOGLE_SEARCH_CONSOLE_SITE && "GOOGLE_SEARCH_CONSOLE_SITE",
		!GOOGLE_ANALYTICS_PROPERTY_ID && "GOOGLE_ANALYTICS_PROPERTY_ID",
	].filter((name) => typeof name === "string");

	const [searchConsole, analytics] = await Promise.all([
		credentials && GOOGLE_SEARCH_CONSOLE_SITE
			? settle(searchConsoleReport(credentials, GOOGLE_SEARCH_CONSOLE_SITE))
			: null,
		credentials && GOOGLE_ANALYTICS_PROPERTY_ID
			? settle(analyticsReport(credentials, GOOGLE_ANALYTICS_PROPERTY_ID))
			: null,
	]);

	return { days: REPORT_DAYS, missing, searchConsole, analytics };
}
