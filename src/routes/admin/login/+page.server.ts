import { githubConfigured, missingAuthConfig } from "#lib/server/auth.ts";

export function load() {
	return { missing: missingAuthConfig(), github: githubConfigured() };
}
