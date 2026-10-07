import { afterEach, describe, expect, it, vi } from "vitest";
import { getAdmin, getAuth } from "../../src/lib/server/auth.ts";

const ORIGIN = "http://localhost:4173";

const env = vi.hoisted(() => ({
	BETTER_AUTH_SECRET: "integration-test-secret-0123456789abcdef",
	BETTER_AUTH_URL: "http://localhost:4173",
	ADMIN_GITHUB_USERS: ["octo-admin"],
	GITHUB_CLIENT_ID: "client-id",
	GITHUB_CLIENT_SECRET: "client-secret",
}));

vi.mock("$app/env/private", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv(env);
});

/** Answers the three calls of the GitHub sign-in as the account `login`. No request leaves the machine. */
function githubAs(login: string) {
	const email = `${login.toLowerCase()}@example.com`;
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
			return Response.json([{ email, primary: true, verified: true }]);
		throw new Error(`Unexpected request to ${url}`);
	});
}

const cookiesOf = (response: Response) =>
	response.headers
		.getSetCookie()
		.map((cookie) => cookie.split(";")[0])
		.join("; ");

/** Runs the whole sign-in: start, the redirect to GitHub and the callback. Returns the callback response. */
async function signIn(login: string): Promise<Response> {
	const auth = await getAuth();
	if (!auth) throw new Error("auth should be configured by the mocked environment");
	githubAs(login);

	const start = await auth.handler(
		new Request(`${ORIGIN}/api/auth/sign-in/social`, {
			method: "POST",
			headers: { "content-type": "application/json", origin: ORIGIN },
			body: JSON.stringify({
				provider: "github",
				callbackURL: "/admin",
				errorCallbackURL: "/admin/login",
			}),
		}),
	);
	const { url } = (await start.json()) as { url: string };
	const state = new URL(url).searchParams.get("state");

	return auth.handler(
		new Request(`${ORIGIN}/api/auth/callback/github?code=code&state=${state}`, {
			headers: { cookie: cookiesOf(start) },
		}),
	);
}

describe("sign-in with GitHub", () => {
	afterEach(() => vi.unstubAllGlobals());

	it("creates the account of someone on the allow list and signs them in", async () => {
		const callback = await signIn("Octo-Admin");

		expect(callback.headers.get("location")).toBe("/admin");
		expect(await getAdmin(new Headers({ cookie: cookiesOf(callback) }))).toMatchObject({
			githubLogin: "octo-admin",
			email: "octo-admin@example.com",
		});
	});

	it("refuses someone outside the allow list", async () => {
		const callback = await signIn("stranger");

		expect(callback.headers.get("location")).toContain("/admin/login?error=");
		expect(await getAdmin(new Headers({ cookie: cookiesOf(callback) }))).toBeNull();
	});

	it("does not let a signed-in user rewrite their GitHub login", async () => {
		const auth = await getAuth();
		if (!auth) throw new Error("auth should be configured by the mocked environment");
		const cookie = cookiesOf(await signIn("Octo-Admin"));

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
