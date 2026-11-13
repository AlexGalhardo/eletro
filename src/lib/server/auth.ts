import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { type TestHelpers, testUtils } from "better-auth/plugins";
import {
	ADMIN_EMAILS,
	ADMIN_GITHUB_USERS,
	AUTH_TEST_LOGIN_TOKEN,
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	DATABASE_URL,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
	GOOGLE_CLIENT_ID,
	GOOGLE_CLIENT_SECRET,
} from "#env";
import { getDb } from "./db/index.ts";
import { account, session, user, verification } from "./db/schema.ts";

export type AdminUser = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	/** `null` for someone who signed in with Google and is allowed by e-mail. */
	githubLogin: string | null;
};

/** Vercel and Netlify both expose which deployment context is running. */
const isProductionDeploy = () =>
	process.env.VERCEL_ENV === "production" || process.env.CONTEXT === "production";

/**
 * Test login is a backdoor by design, so it fails closed: it only exists with the local PGlite database
 * (never with a real DATABASE_URL, whose sessions a production deploy may share) and never in a production deploy.
 */
export const testLoginToken = () =>
	isProductionDeploy() || DATABASE_URL ? undefined : AUTH_TEST_LOGIN_TOKEN;

export const githubConfigured = () => Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);
export const googleConfigured = () => Boolean(GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET);

/** What is still missing before /admin can be used, phrased for the login page. */
export function missingAuthConfig(): string[] {
	const missing: string[] = [];
	if (!BETTER_AUTH_SECRET) missing.push("BETTER_AUTH_SECRET");
	if (!githubConfigured() && !googleConfigured() && !testLoginToken())
		missing.push("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET");
	if (ADMIN_GITHUB_USERS.length === 0 && ADMIN_EMAILS.length === 0) missing.push("ADMIN_GITHUB_USERS");
	return missing;
}

type Identity = { githubLogin?: string | null; email?: string | null; emailVerified?: boolean | null };

/**
 * On the allow list by GitHub username, or by an e-mail the provider verified. An unverified address
 * proves nothing: anyone can type the owner's e-mail into an account they control.
 */
export function isAllowedAdmin(identity: string | Identity | null | undefined): boolean {
	const { githubLogin, email, emailVerified }: Identity =
		typeof identity === "string" ? { githubLogin: identity } : (identity ?? {});

	if (githubLogin && ADMIN_GITHUB_USERS.includes(githubLogin.toLowerCase())) return true;
	return Boolean(email && emailVerified) && ADMIN_EMAILS.includes((email as string).toLowerCase());
}

async function createAuth() {
	return betterAuth({
		secret: BETTER_AUTH_SECRET,
		baseURL: BETTER_AUTH_URL,
		database: drizzleAdapter(await getDb(), {
			provider: "pg",
			schema: { user, session, account, verification },
		}),
		user: {
			additionalFields: {
				// Not `input: false`: better-auth drops such fields from the provider profile too, so the
				// allow list below never saw the login and refused everyone. The update hook keeps it fixed.
				githubLogin: { type: "string", required: false },
			},
		},
		socialProviders: {
			...(githubConfigured() && {
				github: {
					clientId: GITHUB_CLIENT_ID as string,
					clientSecret: GITHUB_CLIENT_SECRET as string,
					// Identity only. Content commits use GITHUB_TOKEN, scoped to a single repository.
					mapProfileToUser: (profile) => ({ githubLogin: profile.login.toLowerCase() }),
				},
			}),
			...(googleConfigured() && {
				google: {
					clientId: GOOGLE_CLIENT_ID as string,
					clientSecret: GOOGLE_CLIENT_SECRET as string,
				},
			}),
		},
		databaseHooks: {
			user: {
				create: {
					// Accounts are only ever created for people on the allow list.
					before: async (candidate) => {
						if (!isAllowedAdmin(candidate as Identity)) return false;
					},
				},
				update: {
					// Login and e-mail are the keys of the allow list: someone removed from it must not be
					// able to rename themselves into an admin through the update-user endpoint.
					before: async (changes) => {
						if ("githubLogin" in changes || "email" in changes) return false;
					},
				},
			},
		},
		plugins: testLoginToken() ? [testUtils()] : [],
	});
}

let auth: ReturnType<typeof createAuth> | undefined;

/** The auth instance, or `null` while the required variables are not configured. */
export function getAuth() {
	if (missingAuthConfig().length > 0) return null;
	auth ??= createAuth();
	return auth;
}

/**
 * Signs a user in without GitHub, for automated tests. Returns the session cookie (`name=value`), or `null`
 * when test login is off or the user is not on the allow list.
 */
export async function testLogin(githubLogin: string): Promise<string | null> {
	const login = githubLogin.trim().toLowerCase();
	if (!testLoginToken() || !isAllowedAdmin(login)) return null;

	const instance = await getAuth();
	if (!instance) return null;

	// The plugin is added conditionally, which hides `test` from the inferred context type.
	const context = await instance.$context;
	const { test } = context as typeof context & { test: TestHelpers };

	const email = `${login}@test.invalid`;
	const find = async () => (await context.internalAdapter.findUserByEmail(email))?.user ?? null;
	// Two sign-ins at once (parallel test workers) both try to create the user; the loser reads the winner's.
	const account =
		(await find()) ??
		(await test.saveUser(test.createUser({ email, name: login, githubLogin: login })).catch(find));
	if (!account) return null;

	const { headers } = await test.login({ userId: account.id });
	return headers.get("cookie");
}

/** The signed-in admin for this request, re-checked against the allow list every time. */
export async function getAdmin(headers: Headers): Promise<AdminUser | null> {
	const instance = await getAuth();
	if (!instance) return null;

	const current = await instance.api.getSession({ headers });
	if (!current || !isAllowedAdmin(current.user as Identity)) return null;

	const { id, name, email, image } = current.user;
	const githubLogin = (current.user as Identity).githubLogin ?? null;
	return { id, name, email, image, githubLogin };
}
