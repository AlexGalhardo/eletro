import { announce } from "@ui-sdk/core";
import { decodeFile, GithubError, PagesRepository, type RepoFile } from "./github-pages.ts";
import { contentImages, linkedProducts, type PostField, postField, setPostField } from "./post-fields.ts";
import { clearSession, LOGIN_PATH, readSession } from "./session.ts";

const folders = ["content/posts", "content/products", "content", "static/images"] as const;

export function initPagesCms(): void {
	const root = document.querySelector<HTMLElement>("[data-pages-cms]");
	if (!root) return;
	const workspaceHeader = root.querySelector<HTMLElement>("[data-workspace-header]");
	const workspace = root.querySelector<HTMLElement>("[data-workspace]");
	const message = root.querySelector<HTMLElement>("[data-message]");
	const list = root.querySelector<HTMLUListElement>("[data-files]");
	const editor = root.querySelector<HTMLTextAreaElement>("[data-editor]");
	const pathLabel = root.querySelector<HTMLElement>("[data-path]");
	const search = root.querySelector<HTMLInputElement>("#file-search");
	const save = root.querySelector<HTMLButtonElement>("[data-save]");
	const review = root.querySelector<HTMLAnchorElement>("[data-review]");
	const postFields = root.querySelector<HTMLElement>("[data-post-fields]");
	const relations = root.querySelector<HTMLElement>("[data-relations]");
	const contentPreview = root.querySelector<HTMLElement>("[data-content-images]");
	const coverPreview = root.querySelector<HTMLImageElement>("[data-cover-preview]");
	const productChoice = root.querySelector<HTMLSelectElement>("[data-product-choice]");
	const imagePanel = root.querySelector<HTMLElement>("[data-image-panel]");
	const imageDetail = root.querySelector<HTMLImageElement>("[data-image-detail]");
	const imagePathLabel = root.querySelector<HTMLElement>("[data-image-path]");
	const useCover = root.querySelector<HTMLButtonElement>("[data-use-cover]");
	const uploadForm = root.querySelector<HTMLFormElement>("[data-upload-form]");
	const uploadPreview = root.querySelector<HTMLElement>("[data-upload-preview]");
	const uploadImage = root.querySelector<HTMLImageElement>("[data-upload-image]");
	const uploadName = root.querySelector<HTMLElement>("[data-upload-name]");
	const uploadInput = uploadForm?.elements.namedItem("image") as HTMLInputElement | undefined;
	const postLinks = JSON.parse(root.dataset.postLinks ?? "{}") as Record<string, string[]>;
	const uploadedUrls = new Map<string, string>();
	let repository: PagesRepository | undefined;
	let folder = root.dataset.folder ?? "content/posts";
	let files: RepoFile[] = [];
	let selected: RepoFile | undefined;
	let selectedImagePath = "";
	let pendingUploadUrl = "";

	function field(name: string): HTMLInputElement | HTMLSelectElement | null {
		return root?.querySelector(`[data-post-field="${name}"]`) ?? null;
	}

	function previewUrl(value: string): string {
		if (
			(!/^\/images\/[a-zA-Z0-9/_.-]+$/.test(value) || value.includes("..")) &&
			!/^https:\/\/\S+$/.test(value)
		)
			return "";
		return uploadedUrls.get(`static${value}`) ?? value;
	}

	function renderCover(): void {
		if (!coverPreview) return;
		const src = previewUrl(field("cover")?.value ?? "");
		coverPreview.hidden = !src;
		if (src) coverPreview.src = src;
		else coverPreview.removeAttribute("src");
	}

	function renderContentImages(): void {
		if (!contentPreview || !editor || !selected) return;
		contentPreview.replaceChildren();
		for (const path of contentImages(editor.value).slice(0, 24)) {
			const src = previewUrl(path);
			if (!src) continue;
			const figure = document.createElement("figure");
			figure.className = "w-28 min-w-0";
			const img = document.createElement("img");
			img.src = src;
			img.alt = "";
			img.loading = "lazy";
			img.className = "aspect-square w-full rounded-lg border border-border bg-muted object-contain ";
			const caption = document.createElement("figcaption");
			caption.textContent = path.split("/").at(-1) ?? path;
			caption.title = path;
			caption.className = "mt-1 truncate text-xs text-muted-foreground ";
			figure.append(img, caption);
			contentPreview.append(figure);
		}
	}

	function relationButton(label: string, path: string): HTMLButtonElement {
		const button = document.createElement("button");
		button.type = "button";
		button.textContent = label;
		button.className =
			"rounded-lg border border-input px-3 py-1.5 text-sm font-semibold text-primary hover:bg-primary/10 ";
		button.addEventListener("click", () => void openRelated(path));
		return button;
	}

	function renderRelations(): void {
		if (!relations || !selected || !editor) return;
		relations.replaceChildren();
		const isPost = selected.path.startsWith("content/posts/");
		const name = selected.name.replace(/\.(mdx|json)$/, "");
		const names = isPost
			? linkedProducts(editor.value)
			: selected.path.startsWith("content/products/")
				? Object.entries(postLinks)
						.filter(([, lists]) => lists.includes(name))
						.map(([slug]) => slug)
				: [];
		if (!isPost && !selected.path.startsWith("content/products/")) return;
		const label = document.createElement("p");
		label.className = "mb-2 font-semibold";
		label.textContent = isPost ? "Listas de produtos vinculadas" : "Posts que usam esta lista";
		relations.append(label);
		const links = document.createElement("div");
		links.className = "flex flex-wrap gap-2";
		for (const item of names) {
			links.append(
				relationButton(
					item,
					`content/${isPost ? "products" : "posts"}/${item}.${isPost ? "json" : "mdx"}`,
				),
			);
		}
		if (names.length === 0) links.textContent = "Nenhum vínculo.";
		relations.append(links);
	}

	function syncPostFields(): void {
		const isPost = !!selected?.path.startsWith("content/posts/");
		if (postFields) postFields.hidden = !isPost;
		if (!isPost || !selected || !editor) {
			if (coverPreview) coverPreview.hidden = true;
			return;
		}
		const slug = field("slug") as HTMLInputElement | null;
		if (slug) {
			slug.value = selected.name.replace(/\.mdx$/, "");
			slug.readOnly = !!selected.sha;
		}
		for (const name of ["title", "description", "date", "category", "cover", "author"] as PostField[]) {
			const input = field(name);
			if (input) input.value = postField(editor.value, name);
		}
		const draft = field("draft") as HTMLInputElement | null;
		if (draft) draft.checked = postField(editor.value, "draft") === "true";
		renderCover();
	}

	function setProductChoices(items: RepoFile[]): void {
		if (!productChoice) return;
		productChoice.replaceChildren(new Option("Escolha um JSON", ""));
		for (const file of items.filter((item) => item.name.endsWith(".json"))) {
			productChoice.add(new Option(file.name, file.name.replace(/\.json$/, "")));
		}
	}

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
				"flex w-full items-center gap-2 truncate rounded-lg px-2 py-2 text-left hover:bg-muted focus-visible:outline-2 focus-visible:outline-ring ";
			if (file.path.startsWith("static/images/") && file.type === "file") {
				const thumbnail = document.createElement("img");
				thumbnail.src =
					uploadedUrls.get(file.path) ?? file.download_url ?? file.path.replace(/^static/, "");
				thumbnail.alt = "";
				thumbnail.loading = "lazy";
				thumbnail.className = "h-12 w-12 shrink-0 rounded border border-border object-cover ";
				button.prepend(thumbnail);
			}
			button.addEventListener("click", () => {
				if (file.type === "dir") void openFolder(file.path);
				else void openFile(file);
			});
			item.append(button);
			list.append(item);
		}
	}

	async function openRelated(path: string): Promise<void> {
		await openFolder(path.slice(0, path.lastIndexOf("/")));
		await openFile({ name: path.split("/").at(-1) ?? path, path, sha: "", type: "file" });
	}

	async function openFolder(path: string): Promise<void> {
		if (!repository || !folders.some((base) => path === base || path.startsWith(`${base}/`))) return;
		try {
			folder = path;
			files = await repository.list(path);
			if (path === "content") files = files.filter((file) => file.name.endsWith(".json"));
			if (path === "content/products") setProductChoices(files);
			renderList();
			status(`${files.length} arquivo(s) em ${path}.`);
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível abrir a pasta.");
		}
	}

	async function openFile(file: RepoFile): Promise<void> {
		if (!repository || !editor) return;
		if (file.path.startsWith("static/images/")) {
			selectedImagePath = file.path;
			if (imagePanel) imagePanel.hidden = false;
			if (imagePathLabel) imagePathLabel.textContent = file.path.replace(/^static/, "");
			if (imageDetail)
				imageDetail.src =
					uploadedUrls.get(file.path) ?? file.download_url ?? file.path.replace(/^static/, "");
			if (useCover)
				useCover.hidden =
					!file.path.startsWith("static/images/covers/") ||
					!selected?.path.startsWith("content/posts/");
			imagePanel?.scrollIntoView({ block: "nearest" });
			return;
		}
		try {
			const remote = await repository.read(file.path);
			if (!remote.content) throw new Error("O GitHub não devolveu o conteúdo do arquivo.");
			selected = remote;
			editor.value = decodeFile(remote.content);
			if (imagePanel) imagePanel.hidden = true;
			if (pathLabel) pathLabel.textContent = remote.path;
			syncPostFields();
			renderContentImages();
			renderRelations();
			status(`Aberto: ${remote.name}`);
			editor.focus();
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível abrir o arquivo.");
		}
	}

	async function toLogin(): Promise<void> {
		await clearSession();
		location.replace(`${LOGIN_PATH}?next=${encodeURIComponent(location.pathname.replace(/\/$/, ""))}`);
	}

	// The login page stored the token; every admin route reopens the workspace from the session.
	async function start(): Promise<void> {
		const token = await readSession();
		if (!token) return toLogin();
		try {
			const candidate = new PagesRepository(root?.dataset.repo ?? "", token);
			await candidate.connect();
			repository = candidate;
		} catch (error) {
			if (error instanceof GithubError && (error.status === 401 || error.status === 403))
				return toLogin();
			return status(error instanceof Error ? error.message : "Não foi possível conectar ao GitHub.");
		}
		if (workspaceHeader) workspaceHeader.hidden = false;
		if (workspace) workspace.hidden = false;
		await openFolder(folder);
		setProductChoices(await repository.list("content/products"));
	}

	void start();

	for (const button of root.querySelectorAll<HTMLButtonElement>("[data-folder]")) {
		button.addEventListener("click", () => void openFolder(button.dataset.folder ?? ""));
	}
	search?.addEventListener("input", renderList);
	for (const input of root.querySelectorAll<HTMLInputElement | HTMLSelectElement>("[data-post-field]")) {
		input.addEventListener("input", () => {
			if (!editor || !selected?.path.startsWith("content/posts/")) return;
			const name = input.dataset.postField;
			if (name === "slug") {
				if (pathLabel) pathLabel.textContent = `content/posts/${input.value}.mdx`;
				return;
			}
			if (
				!name ||
				!["title", "description", "date", "category", "cover", "draft", "author"].includes(name)
			)
				return;
			editor.value = setPostField(
				editor.value,
				name as PostField,
				name === "draft" ? String((input as HTMLInputElement).checked) : input.value,
			);
			renderCover();
			renderContentImages();
			renderRelations();
		});
	}
	root.querySelector<HTMLButtonElement>("[data-link-product]")?.addEventListener("click", () => {
		if (!editor || !selected?.path.startsWith("content/posts/") || !productChoice?.value) return;
		if (linkedProducts(editor.value).includes(productChoice.value)) return;
		editor.value = `${editor.value.trimEnd()}\n\n<CardsTable list="${productChoice.value}" />\n`;
		renderRelations();
		status(`Lista ${productChoice.value} vinculada ao post.`);
	});
	useCover?.addEventListener("click", () => {
		const cover = field("cover") as HTMLInputElement | null;
		if (!cover || !selectedImagePath) return;
		cover.value = selectedImagePath.replace(/^static/, "");
		cover.dispatchEvent(new Event("input", { bubbles: true }));
		status("Capa selecionada. Salve o post para registrar a alteração.");
	});
	editor?.addEventListener("input", () => {
		syncPostFields();
		renderContentImages();
		renderRelations();
	});

	root.querySelector<HTMLButtonElement>("[data-new]")?.addEventListener("click", () => {
		if (folder === "static/images") {
			status("Use o formulário Enviar imagem abaixo.");
			return;
		}
		const isPost = folder === "content/posts";
		const extension = isPost ? ".mdx" : ".json";
		const name = isPost
			? "novo-post"
			: prompt(`Nome do arquivo (sem ${extension}):`)?.trim().toLowerCase();
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
		const category = field("category")?.value ?? "cozinha";
		const author = field("author")?.value ?? "bruno";
		if (editor)
			editor.value =
				extension === ".json"
					? "[]\n"
					: `---\ntitle: ""\ndescription: ""\ndate: "${new Date().toISOString().slice(0, 10)}"\ncategory: "${category}"\ncover: ""\ndraft: true\nauthor: "${author}"\n---\n\nEscreva o conteúdo do post aqui.\n`;
		if (pathLabel) pathLabel.textContent = selected.path;
		if (imagePanel) imagePanel.hidden = true;
		syncPostFields();
		if (isPost) {
			const slug = field("slug") as HTMLInputElement | null;
			if (slug) {
				slug.value = "";
				slug.focus();
			}
		} else editor?.focus();
		renderContentImages();
		renderRelations();
	});

	save?.addEventListener("click", async () => {
		if (!repository || !selected || !editor) {
			status("Selecione ou crie um arquivo antes de salvar.");
			return;
		}
		if (selected.path.startsWith("content/posts/")) {
			const slug = field("slug")?.value.trim() ?? "";
			const title = postField(editor.value, "title").trim();
			const date = postField(editor.value, "date");
			const cover = postField(editor.value, "cover");
			if (
				!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) ||
				slug.length < 3 ||
				!title ||
				!/^\d{4}-\d{2}-\d{2}$/.test(date)
			) {
				status("Preencha slug, título e data de publicação válidos antes de salvar.");
				return;
			}
			if (cover && !previewUrl(cover)) {
				status("A capa deve ser uma imagem em /images/ ou uma URL HTTPS.");
				return;
			}
			if (!selected.sha) {
				selected.name = `${slug}.mdx`;
				selected.path = `content/posts/${slug}.mdx`;
				if (pathLabel) pathLabel.textContent = selected.path;
			}
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
			if (selected.path.startsWith("content/posts/"))
				postLinks[selected.name.replace(/\.mdx$/, "")] = linkedProducts(editor.value);
			status(
				`Salvo no GitHub. Revise e integre o PR para publicar: ${repository.reviewUrl ?? "PR pendente"}`,
			);
			showReview();
			await openFolder(folder);
			const saved = files.find((file) => file.path === selected?.path);
			if (saved) selected = saved;
			syncPostFields();
			renderRelations();
		} catch (error) {
			status(error instanceof Error ? error.message : "Não foi possível salvar.");
		} finally {
			save.disabled = false;
		}
	});

	uploadInput?.addEventListener("change", () => {
		if (pendingUploadUrl && ![...uploadedUrls.values()].includes(pendingUploadUrl))
			URL.revokeObjectURL(pendingUploadUrl);
		const file = uploadInput.files?.[0];
		pendingUploadUrl = file ? URL.createObjectURL(file) : "";
		if (uploadPreview) uploadPreview.hidden = !file;
		if (uploadImage && file) uploadImage.src = pendingUploadUrl;
		if (uploadName) uploadName.textContent = file?.name ?? "";
	});
	uploadForm?.addEventListener("submit", async (event) => {
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
			if (pendingUploadUrl) uploadedUrls.set(path, pendingUploadUrl);
			form.reset();
			if (uploadName) uploadName.textContent = `Enviada: /images/${target}/${name}`;
			renderCover();
			renderContentImages();
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
