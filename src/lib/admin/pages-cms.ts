import { announce } from "@ui-sdk/core";
import { openCredential, type SealedCredential } from "./credential.ts";
import { decodeFile, GithubError, PagesRepository, type RepoFile } from "./github-pages.ts";

const folders = ["content/posts", "content/products", "content", "static/images"] as const;

export function initPagesCms(): void {
	const root = document.querySelector<HTMLElement>("[data-pages-cms]");
	if (!root) return;
	const login = root.querySelector<HTMLElement>("[data-login]");
	const workspaceHeader = root.querySelector<HTMLElement>("[data-workspace-header]");
	const workspace = root.querySelector<HTMLElement>("[data-workspace]");
	const message = root.querySelector<HTMLElement>("[data-message]");
	const list = root.querySelector<HTMLUListElement>("[data-files]");
	const editor = root.querySelector<HTMLTextAreaElement>("[data-editor]");
	const pathLabel = root.querySelector<HTMLElement>("[data-path]");
	const search = root.querySelector<HTMLInputElement>("#file-search");
	const logout = root.querySelector<HTMLButtonElement>("[data-logout]");
	const save = root.querySelector<HTMLButtonElement>("[data-save]");
	const review = root.querySelector<HTMLAnchorElement>("[data-review]");
	let repository: PagesRepository | undefined;
	let folder = "content/posts";
	let files: RepoFile[] = [];
	let selected: RepoFile | undefined;

	function status(text: string): void {
		if (message) message.textContent = text;
		announce(text);
	}

	function showReview(): void {
		if (review && repository?.reviewUrl) {
			review.href = repository.reviewUrl;
			review.hidden = false;
		}
	}

	function renderList(): void {
		if (!list) return;
		list.replaceChildren();
		const term = search?.value.trim().toLocaleLowerCase("pt-BR") ?? "";
		for (const file of files.filter((item) => item.name.toLocaleLowerCase("pt-BR").includes(term))) {
			const item = document.createElement("li");
			const button = document.createElement("button");
			button.type = "button";
			button.textContent = `${file.type === "dir" ? "📁 " : ""}${file.name}`;
			button.className =
				"w-full truncate rounded-lg px-2 py-2 text-left hover:bg-gray-100 focus-visible:outline-2 focus-visible:outline-blue-600 dark:hover:bg-zinc-900";
			button.addEventListener("click", () => {
				if (file.type === "dir") void openFolder(file.path);
				else void openFile(file);
			});
			item.append(button);
			list.append(item);
		}
	}

	async function openFolder(path: string): Promise<void> {
		if (!repository || !folders.some((base) => path === base || path.startsWith(`${base}/`))) return;
		try {
			folder = path;
			files = await repository.list(path);
			if (path === "content") files = files.filter((file) => file.name.endsWith(".json"));
			renderList();
			status(`${files.length} arquivo(s) em ${path}.`);
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível abrir a pasta.");
		}
	}

	async function openFile(file: RepoFile): Promise<void> {
		if (!repository || !editor) return;
		if (file.path.startsWith("static/images/")) {
			status("Imagens são enviadas pelo formulário abaixo. Abra a página pública para visualizá-las.");
			return;
		}
		try {
			const remote = await repository.read(file.path);
			if (!remote.content) throw new Error("O GitHub não devolveu o conteúdo do arquivo.");
			selected = remote;
			editor.value = decodeFile(remote.content);
			if (pathLabel) pathLabel.textContent = remote.path;
			status(`Aberto: ${remote.name}`);
			editor.focus();
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível abrir o arquivo.");
		}
	}

	root.querySelector<HTMLFormElement>("[data-login-form]")?.addEventListener("submit", async (event) => {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const tokenInput = form.elements.namedItem("token") as HTMLInputElement;
		try {
			const sealed = await fetch("/admin-credential.json", { cache: "no-store" });
			const token = sealed.ok
				? await openCredential((await sealed.json()) as SealedCredential, tokenInput.value)
				: tokenInput.value.trim();
			const candidate = new PagesRepository(root.dataset.repo ?? "", token);
			await candidate.connect();
			repository = candidate;
			tokenInput.value = "";
			if (login) login.hidden = true;
			if (workspaceHeader) workspaceHeader.hidden = false;
			if (workspace) workspace.hidden = false;
			if (logout) logout.hidden = false;
			await openFolder(folder);
		} catch (error) {
			status(
				error instanceof GithubError ? error.message : "Não foi possível entrar. Confira a senha.",
			);
		}
	});

	logout?.addEventListener("click", () => {
		repository = undefined;
		selected = undefined;
		files = [];
		if (editor) editor.value = "";
		if (login) login.hidden = false;
		if (workspaceHeader) workspaceHeader.hidden = true;
		if (workspace) workspace.hidden = true;
		logout.hidden = true;
		if (review) review.hidden = true;
		status("Você saiu do painel.");
	});

	for (const button of root.querySelectorAll<HTMLButtonElement>("[data-folder]")) {
		button.addEventListener("click", () => void openFolder(button.dataset.folder ?? ""));
	}
	search?.addEventListener("input", renderList);

	root.querySelector<HTMLButtonElement>("[data-new]")?.addEventListener("click", () => {
		if (folder === "static/images") {
			status("Use o formulário Enviar imagem abaixo.");
			return;
		}
		const extension = folder === "content/posts" ? ".mdx" : ".json";
		const name = prompt(`Nome do arquivo (sem ${extension}):`)?.trim().toLowerCase();
		if (!name) return;
		if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name)) {
			status("Use apenas letras minúsculas, números e hífens no nome.");
			return;
		}
		selected = {
			name: `${name}${extension}`,
			path: `${folder}/${name}${extension}`,
			sha: "",
			type: "file",
		};
		if (editor)
			editor.value =
				extension === ".json"
					? "[]\n"
					: '---\ntitle: ""\ndescription: ""\ndate: 2026-01-01\ncategory: cozinha\ncover: ""\ndraft: true\nauthor: bruno\n---\n\n';
		if (pathLabel) pathLabel.textContent = selected.path;
		editor?.focus();
	});

	save?.addEventListener("click", async () => {
		if (!repository || !selected || !editor) {
			status("Selecione ou crie um arquivo antes de salvar.");
			return;
		}
		if (selected.name.endsWith(".json")) {
			try {
				JSON.parse(editor.value);
			} catch {
				status("JSON inválido. Corrija a sintaxe antes de salvar.");
				return;
			}
		}
		save.disabled = true;
		try {
			await repository.save(selected.path, editor.value, selected.sha || undefined);
			status(
				`Salvo no GitHub. Revise e integre o PR para publicar: ${repository.reviewUrl ?? "PR pendente"}`,
			);
			showReview();
			await openFolder(folder);
			const saved = files.find((file) => file.path === selected?.path);
			if (saved) selected = saved;
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível salvar.");
		} finally {
			save.disabled = false;
		}
	});

	root.querySelector<HTMLFormElement>("[data-upload-form]")?.addEventListener("submit", async (event) => {
		event.preventDefault();
		const form = event.currentTarget as HTMLFormElement;
		const file = (form.elements.namedItem("image") as HTMLInputElement).files?.[0];
		const target = (form.elements.namedItem("folder") as HTMLSelectElement).value;
		if (!repository || !file || !["covers", "posts"].includes(target)) return;
		if (!["image/png", "image/jpeg", "image/webp"].includes(file.type) || file.size > 4_000_000) {
			status("Escolha PNG, JPEG ou WebP com até 4 MB.");
			return;
		}
		const name = file.name.toLowerCase().replace(/[^a-z0-9._-]/g, "-");
		if (!/^[a-z0-9][a-z0-9._-]*\.(png|jpe?g|webp)$/.test(name)) {
			status("Nome de imagem inválido.");
			return;
		}
		try {
			const path = `static/images/${target}/${name}`;
			await repository.saveBytes(path, new Uint8Array(await file.arrayBuffer()));
			form.reset();
			status(
				`Imagem salva: /images/${target}/${name}. Revise o PR: ${repository.reviewUrl ?? "pendente"}`,
			);
			showReview();
			if (folder === `static/images/${target}`) await openFolder(folder);
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível enviar a imagem.");
		}
	});
}
