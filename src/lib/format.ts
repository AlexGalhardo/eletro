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

/** "2026-11-11" → "Há 3 dias": how long ago a post went up, in whole days. */
export function relativeDate(date: string, now: Date = new Date()): string {
	const days = Math.max(
		0,
		Math.floor((now.getTime() - new Date(`${date}T12:00:00`).getTime()) / 86_400_000),
	);
	if (days === 0) return "Hoje";
	if (days === 1) return "Há 1 dia";
	if (days < 30) return `Há ${days} dias`;
	const months = Math.floor(days / 30);
	if (months < 12) return months === 1 ? "Há 1 mês" : `Há ${months} meses`;
	const years = Math.floor(days / 365);
	return years === 1 ? "Há 1 ano" : `Há ${years} anos`;
}
