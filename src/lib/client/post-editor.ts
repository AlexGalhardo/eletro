import { marked } from "marked";
import { api, messagesOf, rememberNotice, slugify, takeNotice } from "#lib/admin/api.ts";
import type { PostInput } from "#lib/content/schema.ts";

function show(form: HTMLFormElement, errors: string[], success: string): void {
	const box = form.querySelector<HTMLElement>("[data-messages]");
	if (!box) return;
	box.replaceChildren();
	if (errors.length > 0) {
		const list = document.createElement("ul");
		list.role = "alert";
		list.className =
			"space-y-1 rounded-lg border border-red-300 bg-red-50 px-4 py-3 dark:border-red-900 dark:bg-red-950";
		for (const message of errors) {
			const item = document.createElement("li");
			item.className = "text-sm text-red-700 dark:text-red-300";
			item.textContent = message;
			list.append(item);
		}
		box.append(list);
		return;
	}
	if (!success) return;
	const status = document.createElement("p");
	status.role = "status";
	status.className = "rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground";
	status.textContent = success;
	box.append(status);
}

function preview(body: string): string {
	const html = marked.parse(
		body.replace(
			/<CardsTable\s+list="([^"]*)"\s*\/>/g,
			'<div class="cards">Lista de produtos: <b>$1</b></div>',
		),
		{ async: false },
	);
	const text = typeof html === "string" ? html : "";
	return `<style>body{font:16px/1.6 system-ui,sans-serif;margin:16px;color:#111}img{max-width:100%}.cards{border:1px dashed #888;border-radius:8px;padding:12px;color:#555}</style>${text}`;
}

function readInitial(form: HTMLFormElement): PostInput {
	const node = form.querySelector("[data-initial]");
	const value: unknown = JSON.parse(node?.textContent || "{}");
	if (!value || typeof value !== "object") throw new Error("Post inicial ausente");
	return value as PostInput;
}

/** Wires the post form: slug suggestion, Markdown preview, FAQ rows and save. */
export function initPostEditor(form: HTMLFormElement): void {
	const isNew = form.dataset.new === "true";
	const title = form.querySelector<HTMLInputElement>("#title");
	const slug = form.querySelector<HTMLInputElement>("#slug");
	const description = form.querySelector<HTMLTextAreaElement>("#description");
	const date = form.querySelector<HTMLInputElement>("#date");
	const category = form.querySelector<HTMLSelectElement>("#category");
	const author = form.querySelector<HTMLSelectElement>("#author");
	const draft = form.querySelector<HTMLInputElement>("#draft");
	const announce = form.querySelector<HTMLInputElement>("#announce");
	const cover = form.querySelector<HTMLInputElement>("#cover");
	const body = form.querySelector<HTMLTextAreaElement>("#body");
	const frame = form.querySelector<HTMLIFrameElement>("[data-preview]");
	const list = form.querySelector<HTMLSelectElement>("#list");
	const faq = form.querySelector<HTMLElement>("[data-faq]");
	const template = form.querySelector<HTMLTemplateElement>("#faq-row");
	let slugTouched = false;
	let saving = false;
	const stored = takeNotice();
	if (stored) show(form, [], stored);

	const paintPreview = (): void => {
		if (frame && body) frame.srcdoc = preview(body.value);
	};
	body?.addEventListener("input", paintPreview);
	paintPreview();

	title?.addEventListener("input", () => {
		if (!isNew || slugTouched || !slug || !title) return;
		slug.value = slugify(title.value);
	});
	slug?.addEventListener("input", () => {
		slugTouched = true;
	});

	draft?.addEventListener("change", () => {
		if (!announce || !draft) return;
		announce.disabled = draft.checked;
		if (draft.checked) announce.checked = false;
	});

	const addFaq = (question = "", answer = ""): void => {
		if (!template || !faq) return;
		const row = template.content.firstElementChild?.cloneNode(true);
		if (!(row instanceof HTMLElement)) return;
		const index = faq.querySelectorAll("[data-faq-row]").length + 1;
		const q = row.querySelector<HTMLInputElement>("[data-question]");
		const a = row.querySelector<HTMLTextAreaElement>("[data-answer]");
		if (q) {
			q.value = question;
			q.setAttribute("aria-label", `Pergunta ${index}`);
		}
		if (a) {
			a.value = answer;
			a.setAttribute("aria-label", `Resposta ${index}`);
		}
		row.querySelector("[data-remove-faq]")?.addEventListener("click", () => row.remove());
		faq.append(row);
	};

	form.querySelector("[data-add-faq]")?.addEventListener("click", () => addFaq());
	for (const row of faq?.querySelectorAll<HTMLElement>("[data-faq-row]") ?? []) {
		row.querySelector("[data-remove-faq]")?.addEventListener("click", () => row.remove());
	}

	form.querySelector("[data-insert-list]")?.addEventListener("click", () => {
		if (!list?.value || !body) return;
		const tag = `<CardsTable list="${list.value}" />`;
		const at = body.selectionStart ?? body.value.length;
		body.value = `${body.value.slice(0, at)}\n\n${tag}\n\n${body.value.slice(at)}`.trim();
		list.value = "";
		paintPreview();
	});

	const buttons = (): void => {
		for (const button of form.querySelectorAll<HTMLButtonElement>("[data-save], [data-delete]")) {
			button.disabled = saving;
			if (button.dataset.save !== undefined) button.textContent = saving ? "Salvando..." : "Salvar";
		}
	};

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (saving || !body || !title || !description || !date || !category || !author || !draft) return;
		saving = true;
		buttons();
		show(form, [], "");
		const initial = readInitial(form);
		const next: PostInput = {
			...initial,
			title: title.value,
			description: description.value,
			date: date.value,
			category: category.value as PostInput["category"],
			author: author.value as PostInput["author"],
			draft: draft.checked,
			cover: cover?.value ?? "",
			body: body.value,
			faqData: [...(faq?.querySelectorAll<HTMLElement>("[data-faq-row]") ?? [])].map((row) => ({
				question: row.querySelector<HTMLInputElement>("[data-question]")?.value ?? "",
				answer: row.querySelector<HTMLTextAreaElement>("[data-answer]")?.value ?? "",
			})),
		};
		try {
			if (isNew) {
				const target = slug?.value || slugify(title.value);
				await api("POST", "/posts", { slug: target, ...next });
				if (announce?.checked && !next.draft)
					await api("POST", "/newsletter/dispatches", { slug: target });
				location.assign(`/admin/posts/${target}`);
				return;
			}
			const saved = await api<{ sha: string }>("PUT", `/posts/${form.dataset.slug}`, {
				sha: form.dataset.sha,
				...next,
			});
			form.dataset.sha = saved.sha;
			const queued = announce?.checked && !next.draft;
			if (queued) await api("POST", "/newsletter/dispatches", { slug: form.dataset.slug });
			const savedMessage = queued
				? "Post salvo. Os assinantes serão avisados quando ele estiver no ar."
				: "Post salvo.";
			if (announce) announce.checked = false;
			rememberNotice(savedMessage);
			location.reload();
		} catch (cause) {
			show(form, messagesOf(cause), "");
			saving = false;
			buttons();
		}
	});

	form.querySelector("[data-delete]")?.addEventListener("click", async () => {
		if (!confirm(`Excluir o post "${title?.value ?? ""}"? Esta ação não pode ser desfeita pelo painel.`))
			return;
		saving = true;
		buttons();
		show(form, [], "");
		try {
			await api("DELETE", `/posts/${form.dataset.slug}?sha=${form.dataset.sha ?? ""}`);
			location.assign("/admin/posts");
		} catch (cause) {
			show(form, messagesOf(cause), "");
			saving = false;
			buttons();
		}
	});
}
