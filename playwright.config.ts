import { defineConfig, devices } from "@playwright/test";
import { ADMIN, CONTENT_ROOT, LOGIN_TOKEN } from "./tests/e2e/env.ts";

const PORT = 4173;
// An explicit IPv4 address: on Windows `localhost` may resolve to ::1 while the server listens on 127.0.0.1
// only, which shows up as random refused or hanging connections.
const ORIGIN = `http://127.0.0.1:${PORT}`;

export default defineConfig({
	testDir: "tests/e2e",
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 2 : 0,
	reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
	use: {
		baseURL: ORIGIN,
		trace: "retain-on-failure",
	},
	projects: [
		{ name: "desktop", use: { ...devices["Desktop Chrome"] } },
		{ name: "mobile", use: { ...devices["Pixel 7"] } },
	],
	// Tests run against the production build, the same artifact that gets deployed.
	webServer: {
		command: `bun run build && bun run preview --host 127.0.0.1 --port ${PORT} --strictPort`,
		url: ORIGIN,
		reuseExistingServer: !process.env.CI,
		timeout: 180_000,
		// A throwaway admin: in-memory database, test login instead of GitHub, content written to a scratch folder.
		env: {
			PGLITE_DIR: "memory://",
			BETTER_AUTH_SECRET: "e2e-only-secret-0123456789abcdef0123456789",
			BETTER_AUTH_URL: ORIGIN,
			ADMIN_GITHUB_USERS: ADMIN,
			AUTH_TEST_LOGIN_TOKEN: LOGIN_TOKEN,
			CONTENT_ROOT,
		},
	},
});
