import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdmin, getAuth, isAllowedAdmin } from "../../src/lib/server/auth.ts";

const ORIGIN = "http://localhost:4173";

const env = vi.hoisted(() => ({
	BETTER_AUTH_SECRET: "integration-test-secret-0123456789abcdef",
	BETTER_AUTH_URL: "http://localhost:4173",
	ADMIN_GITHUB_USERS: ["octo-admin"],
	ADMIN_EMAILS: ["owner@example.com"],
	GITHUB_CLIENT_ID: "client-id",
	GITHUB_CLIENT_SECRET: "client-secret",
	GOOGLE_CLIENT_ID: "google-client-id",
	GOOGLE_CLIENT_SECRET: "google-client-secret",
}));

vi.mock("$app/env/private", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv(env);
});

type Identity = { login?: string; email: string; verified?: boolean };

const base64url = (value: unknown) => Buffer.from(JSON.stringify(value)).toString("base64url");

/** Answers the calls of both providers as the given person. No request leaves the machine. */
function providersAs({ login = "someone", email, verified = true }: Identity) {
	// Google sends the identity inside the id token; better-auth reads its claims in this flow.
	const idToken = [
		base64url({ alg: "none" }),
		base64url({ sub: email, email, email_verified: verified, name: login, picture: "" }),
		"signature",
	].join(".");

	vi.stubGlobal("fetch", async (input: RequestInfo | URL) => {
		const url = String(input instanceof Request ? input.url : input);
		if (url.startsWith("https://github.com/login/oauth/access_token"))
			return Response.json({
				access_token: "token",
				token_type: "bearer",
				scope: "read:user,user:email",
			});
		if (url === "https://api.github.com/user")
			return Response.json({ id: login.length, login, name: login, email, avatar_url: "" });
		if (url === "https://api.github.com/user/emails")
			return Response.json([{ email, primary: true, verified }]);
		if (url.startsWith("https://oauth2.googleapis.com/token"))
			return Response.json({
				access_token: "token",
				token_type: "Bearer",
				expires_in: 3600,
				id_token: idToken,
			});
		throw new Error(`Unexpected request to ${url}`);
	});
}

const cookiesOf = (response: Response) =>
	response.headers
		.getSetCookie()
		.map((cookie) => cookie.split(";")[0])
		.join("; ");

/** Runs the whole sign-in: start, the redirect to the provider and the callback. Returns the callback response. */
async function signIn(provider: "github" | "google", identity: Identity): Promise<Response> {
	const auth = await getAuth();
	if (!auth) throw new Error("auth should be configured by the mocked environment");
	providersAs(identity);

	const start = await auth.handler(
		new Request(`${ORIGIN}/api/auth/sign-in/social`, {
			method: "POST",
			headers: { "content-type": "application/json", origin: ORIGIN },
			body: JSON.stringify({ provider, callbackURL: "/admin", errorCallbackURL: "/admin/login" }),
		}),
	);
	const { url } = (await start.json()) as { url: string };
	const state = new URL(url).searchParams.get("state");

	return auth.handler(
		new Request(`${ORIGIN}/api/auth/callback/${provider}?code=code&state=${state}`, {
			headers: { cookie: cookiesOf(start) },
		}),
	);
}

const adminOf = (response: Response) => getAdmin(new Headers({ cookie: cookiesOf(response) }));

afterEach(() => vi.unstubAllGlobals());

describe("sign-in with GitHub", () => {
	it("creates the account of someone on the allow list and signs them in", async () => {
		const callback = await signIn("github", { login: "Octo-Admin", email: "octo-admin@example.com" });

		expect(callback.headers.get("location")).toBe("/admin");
		expect(await adminOf(callback)).toMatchObject({
			githubLogin: "octo-admin",
			email: "octo-admin@example.com",
		});
	});

	it("refuses someone outside the allow list", async () => {
		const callback = await signIn("github", { login: "stranger", email: "stranger@example.com" });

		expect(callback.headers.get("location")).toContain("/admin/login?error=");
		expect(await adminOf(callback)).toBeNull();
	});

	it("refuses a login outside the allow list whose allowed e-mail GitHub did not verify", async () => {
		const callback = await signIn("github", {
			login: "stranger",
			email: "owner@example.com",
			verified: false,
		});

		expect(callback.headers.get("location")).toContain("/admin/login?error=");
		expect(await adminOf(callback)).toBeNull();
	});

	it("does not let a signed-in user rewrite their GitHub login", async () => {
		const auth = await getAuth();
		if (!auth) throw new Error("auth should be configured by the mocked environment");
		const cookie = cookiesOf(
			await signIn("github", { login: "Octo-Admin", email: "octo-admin@example.com" }),
		);

		await auth.handler(
			new Request(`${ORIGIN}/api/auth/update-user`, {
				method: "POST",
				headers: { "content-type": "application/json", origin: ORIGIN, cookie },
				body: JSON.stringify({ githubLogin: "someone-else" }),
			}),
		);

		expect((await getAdmin(new Headers({ cookie })))?.githubLogin).toBe("octo-admin");
	});
});

describe("sign-in with Google", () => {
	it("signs in someone whose verified e-mail is on the allow list", async () => {
		const callback = await signIn("google", { login: "Owner", email: "Owner@Example.com" });

		expect(callback.headers.get("location")).toBe("/admin");
		expect(await adminOf(callback)).toMatchObject({ email: "owner@example.com", githubLogin: null });
	});

	it("refuses an e-mail outside the allow list", async () => {
		const callback = await signIn("google", { email: "stranger@example.com" });

		expect(callback.headers.get("location")).toContain("/admin/login?error=");
		expect(await adminOf(callback)).toBeNull();
	});

	it("refuses the sign-in of an allowed e-mail that Google did not verify", async () => {
		const callback = await signIn("google", { email: "owner@example.com", verified: false });

		expect(callback.headers.get("location")).toContain("/admin/login?error=");
		expect(await adminOf(callback)).toBeNull();
	});

	it("refuses an allowed e-mail that the provider did not verify", async () => {
		expect(isAllowedAdmin({ email: "owner@example.com", emailVerified: false })).toBe(false);
		expect(isAllowedAdmin({ email: "owner@example.com", emailVerified: true })).toBe(true);
	});
});
