/**
 * Stand-in for `$app/env/private` in integration tests. SvelteKit only fills that module when its server
 * starts, so tests mock it: `vi.mock("$app/env/private", () => testEnv({ ... }))`.
 * Every declared variable must be present, otherwise Vitest rejects the access to a missing export.
 */
export function testEnv(overrides: Record<string, unknown> = {}): Record<string, unknown> {
	return {
		DATABASE_URL: undefined,
		PGLITE_DIR: "memory://",
		BETTER_AUTH_SECRET: undefined,
		BETTER_AUTH_URL: undefined,
		GITHUB_CLIENT_ID: undefined,
		GITHUB_CLIENT_SECRET: undefined,
		GOOGLE_CLIENT_ID: undefined,
		GOOGLE_CLIENT_SECRET: undefined,
		ADMIN_GITHUB_USERS: [],
		ADMIN_EMAILS: [],
		AUTH_TEST_LOGIN_TOKEN: undefined,
		GITHUB_TOKEN: undefined,
		GITHUB_REPO: undefined,
		GITHUB_BRANCH: undefined,
		CONTENT_ROOT: undefined,
		RESEND_API_KEY: undefined,
		RESEND_FROM_EMAIL: undefined,
		CONTACT_TO_EMAIL: undefined,
		CRON_SECRET: undefined,
		MISTRAL_API_KEY: undefined,
		GOOGLE_SERVICE_ACCOUNT_EMAIL: undefined,
		GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY: undefined,
		GOOGLE_SEARCH_CONSOLE_SITE: undefined,
		GOOGLE_ANALYTICS_PROPERTY_ID: undefined,
		...overrides,
	};
}
