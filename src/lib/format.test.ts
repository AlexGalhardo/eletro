import { describe, expect, test } from "vitest";
import { relativeDate } from "./format.ts";

const now = new Date("2026-11-14T15:00:00");

describe("relativeDate", () => {
	test.each([
		["2026-11-14", "Hoje"],
		["2026-11-13", "Há 1 dia"],
		["2026-11-11", "Há 3 dias"],
		["2026-10-01", "Há 1 mês"],
		["2026-07-01", "Há 4 meses"],
		["2025-10-01", "Há 1 ano"],
		["2023-01-01", "Há 3 anos"],
	])("%s is %s", (date, label) => {
		expect(relativeDate(date, now)).toBe(label);
	});

	test("a date in the future reads as today", () => {
		expect(relativeDate("2026-12-01", now)).toBe("Hoje");
	});
});
