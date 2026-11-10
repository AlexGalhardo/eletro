import { afterEach, describe, expect, it, vi } from "vitest";
import raw from "../../content/flags.json";
import { browserFlag, flagDefaults, setBrowserFlag } from "./flags.ts";

describe("feature flags", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("content/flags.json holds only booleans", () => {
		for (const value of Object.values(raw)) expect(typeof value).toBe("boolean");
	});

	it("uses the committed default until this browser overrides it", () => {
		const data = new Map<string, string>();
		vi.stubGlobal("localStorage", {
			getItem: (key: string) => data.get(key) ?? null,
			setItem: (key: string, value: string) => data.set(key, value),
		});
		expect(browserFlag("allStoreButtons")).toBe(flagDefaults.allStoreButtons);
		setBrowserFlag("allStoreButtons", !flagDefaults.allStoreButtons);
		expect(browserFlag("allStoreButtons")).toBe(!flagDefaults.allStoreButtons);
	});

	it("falls back to the default when storage is unavailable", () => {
		vi.stubGlobal("localStorage", {
			getItem: () => {
				throw new Error("blocked");
			},
		});
		expect(browserFlag("allStoreButtons")).toBe(flagDefaults.allStoreButtons);
	});
});
