import { CONTENT_ROOT, GITHUB_BRANCH, GITHUB_REPO, GITHUB_TOKEN } from "$app/env/private";
import { createGitHubStore } from "./github.ts";
import { createLocalStore } from "./local.ts";
import type { ContentStore } from "./types.ts";

let store: ContentStore | undefined;

/** GitHub when a token and repository are configured, the local working copy otherwise. */
export function getStore(): ContentStore {
	store ??=
		GITHUB_TOKEN && GITHUB_REPO
			? createGitHubStore({ token: GITHUB_TOKEN, repo: GITHUB_REPO, branch: GITHUB_BRANCH ?? "main" })
			: createLocalStore(CONTENT_ROOT ?? process.cwd());
	return store;
}
