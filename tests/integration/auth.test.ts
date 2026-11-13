import type { TestHelpers } from "better-auth/plugins";
import { describe, expect, it, vi } from "vitest";
import {
	getAdmin,
	getAuth,
	isAllowedAdmin,
	missingAuthConfig,
	testLogin,
} from "../../src/lib/server/auth.ts";

const env = vi.hoisted(() => ({
	BETTER_AUTH_SECRET: "integration-test-secret-0123456789abcdef",
	BETTER_AUTH_URL: "http://localhost:4173",
	ADMIN_GITHUB_USERS: ["octo-admin", "second-admin"],
	AUTH_TEST_LOGIN_TOKEN: "test-login-token",
}));

vi.mock("#env", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv(env);
});

const headersOf = (cookie: string | null) => new Headers(cookie ? { cookie } : {});

describe("admin authentication", () => {
	it("is configured by the secret, the allow list and a way to sign in", () => {
		expect(missingAuthConfig()).toEqual([]);
		expect(isAllowedAdmin("Octo-Admin")).toBe(true);
		expect(isAllowedAdmin("stranger")).toBe(false);
		expect(isAllowedAdmin(null)).toBe(false);
	});

	it("has no admin for a request without a session or with a forged cookie", async () => {
		expect(await getAdmin(new Headers())).toBeNull();
		expect(await getAdmin(headersOf("better-auth.session_token=forged.signature"))).toBeNull();
	});

	it("signs an allowed user in and resolves the admin from the session cookie", async () => {
		const cookie = await testLogin("Octo-Admin");

		expect(cookie).toMatch(/^better-auth\.session_token=.+/);
		expect(await getAdmin(headersOf(cookie))).toMatchObject({
			githubLogin: "octo-admin",
			email: "octo-admin@test.invalid",
		});
	});

	it("reuses the account on a second sign-in", async () => {
		const first = await getAdmin(headersOf(await testLogin("second-admin")));
		const second = await getAdmin(headersOf(await testLogin("second-admin")));

		expect(second?.id).toBe(first?.id);
	});

	it("never creates an account for someone outside the allow list", async () => {
		expect(await testLogin("stranger")).toBeNull();

		const auth = await getAuth();
		if (!auth) throw new Error("auth should be configured by the mocked environment");
		const { test } = (await auth.$context) as unknown as { test: TestHelpers };
		const stranger = test.createUser({ email: "stranger@test.invalid", githubLogin: "stranger" });

		expect(await test.saveUser(stranger)).toBeNull();
	});

	it("drops an existing session as soon as the user leaves the allow list", async () => {
		const cookie = await testLogin("second-admin");
		expect(await getAdmin(headersOf(cookie))).not.toBeNull();

		env.ADMIN_GITHUB_USERS.pop();
		try {
			expect(await getAdmin(headersOf(cookie))).toBeNull();
		} finally {
			env.ADMIN_GITHUB_USERS.push("second-admin");
		}
	});
});
