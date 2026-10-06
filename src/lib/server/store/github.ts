import { ConflictError, type ContentStore, type HistoryEntry } from "./types.ts";

type Options = { token: string; repo: string; branch: string; fetch?: typeof fetch };

const toBase64 = (bytes: Uint8Array) => Buffer.from(bytes).toString("base64");
const fromBase64 = (text: string) => new Uint8Array(Buffer.from(text, "base64"));

/**
 * Stores content as commits through the GitHub Contents API, which is what triggers a new deploy.
 * https://docs.github.com/en/rest/repos/contents
 */
export function createGitHubStore({ token, repo, branch, fetch: request = fetch }: Options): ContentStore {
	const url = (filePath: string) =>
		`https://api.github.com/repos/${repo}/contents/${filePath.split("/").map(encodeURIComponent).join("/")}`;

	const headers = {
		Accept: "application/vnd.github+json",
		Authorization: `Bearer ${token}`,
		"X-GitHub-Api-Version": "2022-11-28",
		"User-Agent": "sveltekit-blog-cms",
	};

	async function call(method: string, filePath: string, body?: Record<string, unknown>) {
		const target =
			method === "GET" ? `${url(filePath)}?ref=${encodeURIComponent(branch)}` : url(filePath);
		return request(target, {
			method,
			headers: { ...headers, ...(body ? { "Content-Type": "application/json" } : {}) },
			body: body ? JSON.stringify({ ...body, branch }) : undefined,
		});
	}

	async function fail(response: Response, action: string): Promise<never> {
		const detail = await response.text().catch(() => "");
		throw new Error(`GitHub ${action} failed with ${response.status}: ${detail.slice(0, 300)}`);
	}

	return {
		kind: "github",

		async list(dir) {
			const response = await call("GET", dir);
			if (response.status === 404) return [];
			if (!response.ok) await fail(response, `list ${dir}`);

			// ponytail: the Contents API returns at most 1,000 entries per folder; move to the Git Trees API beyond that.
			const entries = (await response.json()) as {
				type: string;
				name: string;
				path: string;
				sha: string;
			}[];
			return entries
				.filter((entry) => entry.type === "file")
				.map(({ name, path, sha }) => ({ name, path, sha }));
		},

		async read(filePath) {
			const response = await call("GET", filePath);
			if (response.status === 404) return null;
			if (!response.ok) await fail(response, `read ${filePath}`);

			const file = (await response.json()) as { content: string; sha: string };
			return { path: filePath, bytes: fromBase64(file.content), sha: file.sha };
		},

		async write(filePath, bytes, { message, author, sha }) {
			const response = await call("PUT", filePath, {
				message,
				content: toBase64(bytes),
				sha,
				author,
				committer: author,
			});
			// 409: the branch moved under us. 422: `sha` missing for an existing file or not matching it.
			if (response.status === 409 || response.status === 422) throw new ConflictError(filePath);
			if (!response.ok) await fail(response, `write ${filePath}`);

			const result = (await response.json()) as { content: { sha: string } };
			return { sha: result.content.sha };
		},

		async remove(filePath, { message, author, sha }) {
			const response = await call("DELETE", filePath, { message, sha, author, committer: author });
			if (response.status === 409 || response.status === 422) throw new ConflictError(filePath);
			if (!response.ok) await fail(response, `remove ${filePath}`);
		},

		// https://docs.github.com/en/rest/commits/commits#list-commits
		async history(dir, limit) {
			const query = new URLSearchParams({ sha: branch, path: dir, per_page: String(limit) });
			const response = await request(`https://api.github.com/repos/${repo}/commits?${query}`, {
				headers,
			});
			if (!response.ok) await fail(response, `history of ${dir}`);

			const commits = (await response.json()) as {
				sha: string;
				html_url: string;
				commit: { message: string; author: { name: string; date: string } };
			}[];
			return commits.map(
				({ sha, html_url, commit }): HistoryEntry => ({
					sha,
					// Only the subject line: the dashboard shows a one-line list.
					message: commit.message.split("\n")[0] ?? "",
					author: commit.author.name,
					date: commit.author.date,
					url: html_url,
				}),
			);
		},
	};
}
