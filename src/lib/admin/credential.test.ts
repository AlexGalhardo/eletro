import { describe, expect, it } from "vitest";
import { openCredential, sealCredential } from "./credential.ts";

describe("sealed admin credential", () => {
	it("unlocks the token with the correct password and rejects another password", async () => {
		const password = "a long private admin passphrase";
		const payload = await sealCredential("github-token", password);
		expect(JSON.stringify(payload)).not.toContain("github-token");
		expect(await openCredential(payload, password)).toBe("github-token");
		await expect(openCredential(payload, "an incorrect admin password")).rejects.toThrow();
	});

	it("rejects short passwords", async () => {
		await expect(sealCredential("github-token", "too-short")).rejects.toThrow();
	});
});
