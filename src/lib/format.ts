import { site } from "./site.config.ts";

/** "2026-09-04" → "4 de setembro de 2026" (in the site locale). */
export function formatDate(date: string): string {
	// Noon avoids the date shifting a day in timezones behind UTC.
	return new Date(`${date}T12:00:00`).toLocaleDateString(site.locale, {
		day: "numeric",
		month: "long",
		year: "numeric",
	});
}

export function readingTimeLabel(minutes: number): string {
	return `${minutes} ${minutes > 1 ? "minutos de leitura" : "minuto de leitura"}`;
}
