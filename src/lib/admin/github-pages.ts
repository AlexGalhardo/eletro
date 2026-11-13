export interface RepoFile {
	name: string;
	path: string;
	sha: string;
	type: "file" | "dir";
	content?: string;
}

const api = "https://api.github.com";

export class GithubError extends Error {
	constructor(
		readonly status: number,
		message: string,
	) {
		super(message);
	}
}

export class PagesRepository {
	private editBranch: string | undefined;
	private pullUrl: string | undefined;

	constructor(
		private readonly repository: string,
		private readonly token: string,
		private readonly branch = "main",
	) {}

	get reviewUrl(): string | undefined {
		return this.pullUrl;
	}

	private async request<T>(path: string, init?: RequestInit): Promise<T> {
		const response = await fetch(`${api}/repos/${this.repository}${path ? `/${path}` : ""}`, {
			...init,
			headers: {
				Accept: "application/vnd.github+json",
				Authorization: `Bearer ${this.token}`,
				"X-GitHub-Api-Version": "2022-11-28",
				...(init?.body ? { "Content-Type": "application/json" } : {}),
			},
		});
		if (!response.ok) {
			const message =
				response.status === 409
					? "O arquivo mudou no GitHub. Reabra antes de salvar."
					: response.status === 401 || response.status === 403
						? "Token sem acesso de escrita a este repositório."
						: `GitHub recusou a operação (${response.status}).`;
			throw new GithubError(response.status, message);
		}
		return response.json() as Promise<T>;
	}

	async connect(): Promise<void> {
		const response = await fetch(`${api}/user`, {
			headers: { Authorization: `Bearer ${this.token}`, Accept: "application/vnd.github+json" },
		});
		if (!response.ok) throw new GithubError(response.status, "Token do GitHub inválido ou expirado.");
		const repo = await this.request<{ permissions?: { push?: boolean } }>("");
		if (!repo.permissions?.push) throw new GithubError(403, "Esta conta não pode gravar no repositório.");
	}

	async list(folder: string): Promise<RepoFile[]> {
		return this.request(`contents/${folder}?ref=${encodeURIComponent(this.editBranch ?? this.branch)}`);
	}

	async read(path: string): Promise<RepoFile> {
		return this.request(`contents/${path}?ref=${encodeURIComponent(this.editBranch ?? this.branch)}`);
	}

	async save(path: string, content: string, sha?: string): Promise<void> {
		const bytes = new TextEncoder().encode(content);
		await this.saveBytes(path, bytes, sha);
	}

	async saveBytes(path: string, bytes: Uint8Array, sha?: string): Promise<void> {
		await this.ensureBranch();
		let binary = "";
		for (let offset = 0; offset < bytes.length; offset += 0x8000) {
			binary += String.fromCharCode(...bytes.subarray(offset, offset + 0x8000));
		}
		await this.request(`contents/${path}`, {
			method: "PUT",
			body: JSON.stringify({
				message: `content: update ${path}`,
				content: btoa(binary),
				branch: this.editBranch,
				...(sha ? { sha } : {}),
			}),
		});
		if (!this.pullUrl) {
			const pull = await this.request<{ html_url: string }>("pulls", {
				method: "POST",
				body: JSON.stringify({
					title: "content: update site content",
					head: this.editBranch,
					base: this.branch,
					body: "Alterações feitas pelo painel editorial estático. Revise os arquivos e os checks antes do merge.",
				}),
			});
			this.pullUrl = pull.html_url;
		}
	}

	private async ensureBranch(): Promise<void> {
		if (this.editBranch) return;
		const base = await this.request<{ object: { sha: string } }>(`git/ref/heads/${this.branch}`);
		const name = `cms/edit-${crypto.randomUUID().slice(0, 12)}`;
		await this.request("git/refs", {
			method: "POST",
			body: JSON.stringify({ ref: `refs/heads/${name}`, sha: base.object.sha }),
		});
		this.editBranch = name;
	}
}

export function decodeFile(content: string): string {
	const binary = atob(content.replace(/\s/g, ""));
	return new TextDecoder().decode(Uint8Array.from(binary, (character) => character.charCodeAt(0)));
}
