import { githubConfigured, googleConfigured, missingAuthConfig, testLoginToken } from "#lib/server/auth.ts";

export function load() {
	// Only whether the local sign-in exists is sent to the page, never the token.
	return {
		missing: missingAuthConfig(),
		github: githubConfigured(),
		google: googleConfigured(),
		local: Boolean(testLoginToken()),
	};
}
