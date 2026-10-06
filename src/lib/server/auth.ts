import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { testUtils } from "better-auth/plugins";
import {
	ADMIN_GITHUB_USERS,
	AUTH_TEST_LOGIN_TOKEN,
	BETTER_AUTH_SECRET,
	BETTER_AUTH_URL,
	GITHUB_CLIENT_ID,
	GITHUB_CLIENT_SECRET,
} from "$app/env/private";
import { getDb } from "./db/index.ts";
import { account, session, user, verification } from "./db/schema.ts";

export type AdminUser = {
	id: string;
	name: string;
	email: string;
	image?: string | null;
	githubLogin: string;
};

/** Vercel and Netlify both expose which deployment context is running. */
const isProductionDeploy = () =>
	process.env.VERCEL_ENV === "production" || process.env.CONTEXT === "production";

/** Test login is a backdoor by design, so it only exists outside production and behind a secret token. */
export const testLoginToken = () => (isProductionDeploy() ? undefined : AUTH_TEST_LOGIN_TOKEN);

const githubConfigured = () => Boolean(GITHUB_CLIENT_ID && GITHUB_CLIENT_SECRET);

/** What is still missing before /admin can be used, phrased for the login page. */
export function missingAuthConfig(): string[] {
	const missing: string[] = [];
	if (!BETTER_AUTH_SECRET) missing.push("BETTER_AUTH_SECRET");
	if (!githubConfigured() && !testLoginToken()) missing.push("GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET");
	if (ADMIN_GITHUB_USERS.length === 0) missing.push("ADMIN_GITHUB_USERS");
	return missing;
}

export const isAllowedAdmin = (githubLogin: string | null | undefined) =>
	Boolean(githubLogin) && ADMIN_GITHUB_USERS.includes((githubLogin as string).toLowerCase());

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
				githubLogin: { type: "string", required: false, input: false },
			},
		},
		socialProviders: githubConfigured()
			? {
					github: {
						clientId: GITHUB_CLIENT_ID as string,
						clientSecret: GITHUB_CLIENT_SECRET as string,
						// Identity only. Content commits use GITHUB_TOKEN, scoped to a single repository.
						mapProfileToUser: (profile) => ({ githubLogin: profile.login.toLowerCase() }),
					},
				}
			: {},
		databaseHooks: {
			user: {
				create: {
					// Accounts are only ever created for people on the allow list.
					before: async (candidate) => {
						if (!isAllowedAdmin((candidate as { githubLogin?: string }).githubLogin))
							return false;
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

/** The signed-in admin for this request, re-checked against the allow list every time. */
export async function getAdmin(headers: Headers): Promise<AdminUser | null> {
	const instance = await getAuth();
	if (!instance) return null;

	const current = await instance.api.getSession({ headers });
	const githubLogin = (current?.user as { githubLogin?: string } | undefined)?.githubLogin;
	if (!current || !githubLogin || !isAllowedAdmin(githubLogin)) return null;

	const { id, name, email, image } = current.user;
	return { id, name, email, image, githubLogin };
}
