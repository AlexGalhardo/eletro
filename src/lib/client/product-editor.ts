import { api, messagesOf, rememberNotice, slugify, takeNotice } from "#lib/admin/api.ts";
import { bindImageFields } from "#lib/client/image-field.ts";
import type { Product } from "#lib/content/schema.ts";

const STORE_KEYS = ["mercadolivreUrl", "shopeeUrl", "amazonUrl"] as const;

/** Keeps unknown product keys and an untouched empty store link (null stays null). */
export function overlayProduct(
	base: Product,
	fields: {
		id: string;
		name: string;
		image: string;
		advantages: string[];
		technicalDetails: Product["technicalDetails"];
		stores: Record<(typeof STORE_KEYS)[number], string>;
	},
): Product {
	const next: Product = {
		...base,
		id: fields.id || slugify(fields.name),
		name: fields.name,
		image: fields.image,
		advantages: fields.advantages,
		technicalDetails: fields.technicalDetails,
	};
	for (const key of STORE_KEYS) {
		const value = fields.stores[key];
		const shown = base[key] ?? "";
		next[key] = value === String(shown) ? base[key] : value;
	}
	return next;
}

function show(form: HTMLFormElement, errors: string[], success: string): void {
	const box = form.querySelector<HTMLElement>("[data-messages]");
	if (!box) return;
	box.replaceChildren();
	if (errors.length === 0 && !success) return;
	const node = document.createElement(errors.length > 0 ? "ul" : "p");
	node.role = errors.length > 0 ? "alert" : "status";
	node.className =
		errors.length > 0
			? "space-y-1 rounded-lg border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900 dark:bg-red-950 dark:text-red-300"
			: "rounded-lg border border-border bg-muted px-4 py-3 text-sm text-foreground";
	if (errors.length === 0) node.textContent = success;
	else {
		for (const message of errors) {
			const item = document.createElement("li");
			item.textContent = message;
			node.append(item);
		}
	}
	box.append(node);
}

function readBase(card: HTMLElement): Product {
	const raw = card.querySelector("[data-product-json]")?.textContent;
	if (!raw) {
		return {
			id: "",
			name: "",
			image: "",
			mercadolivreUrl: "",
			shopeeUrl: "",
			amazonUrl: "",
			advantages: [],
			technicalDetails: [],
		};
	}
	const parsed: unknown = JSON.parse(raw);
	if (!parsed || typeof parsed !== "object") throw new Error("Produto inicial inválido");
	return parsed as Product;
}

function readProduct(card: HTMLElement): Product {
	const lines = (card.querySelector<HTMLTextAreaElement>("[data-advantages]")?.value ?? "")
		.split("\n")
		.map((line) => line.trim())
		.filter(Boolean);
	const details = [...card.querySelectorAll<HTMLElement>("[data-detail]")].map((row) => ({
		label: row.querySelector<HTMLInputElement>("[data-label]")?.value ?? "",
		value: row.querySelector<HTMLInputElement>("[data-value]")?.value ?? "",
	}));
	return overlayProduct(readBase(card), {
		id: card.querySelector<HTMLInputElement>("[data-id]")?.value ?? "",
		name: card.querySelector<HTMLInputElement>("[data-name]")?.value ?? "",
		image: card.querySelector<HTMLInputElement>("[data-image-url]")?.value ?? "",
		advantages: lines,
		technicalDetails: details,
		stores: {
			mercadolivreUrl:
				card.querySelector<HTMLInputElement>("[data-store='mercadolivreUrl']")?.value ?? "",
			shopeeUrl: card.querySelector<HTMLInputElement>("[data-store='shopeeUrl']")?.value ?? "",
			amazonUrl: card.querySelector<HTMLInputElement>("[data-store='amazonUrl']")?.value ?? "",
		},
	});
}

function bindCard(card: HTMLElement, form: HTMLFormElement): void {
	card.querySelector("[data-remove-product]")?.addEventListener("click", () => {
		if (form.querySelectorAll("[data-product]").length === 1) return;
		card.remove();
		renumber(form);
	});
	card.querySelector("[data-up]")?.addEventListener("click", () => move(card, -1, form));
	card.querySelector("[data-down]")?.addEventListener("click", () => move(card, 1, form));
	card.querySelector("[data-add-detail]")?.addEventListener("click", () => {
		const template = form.querySelector<HTMLTemplateElement>("#detail-row");
		const list = card.querySelector("[data-details]");
		const row = template?.content.firstElementChild?.cloneNode(true);
		if (!(row instanceof HTMLElement) || !list) return;
		row.querySelector("[data-remove-detail]")?.addEventListener("click", () => row.remove());
		list.append(row);
	});
	for (const row of card.querySelectorAll<HTMLElement>("[data-detail]")) {
		row.querySelector("[data-remove-detail]")?.addEventListener("click", () => row.remove());
	}
	const name = card.querySelector<HTMLInputElement>("[data-name]");
	const id = card.querySelector<HTMLInputElement>("[data-id]");
	name?.addEventListener("input", () => {
		if (id && !id.value) id.placeholder = slugify(name.value) || "gerado a partir do nome";
		renumber(form);
	});
}

function move(card: HTMLElement, by: number, form: HTMLFormElement): void {
	const list = [...form.querySelectorAll<HTMLElement>("[data-product]")];
	const index = list.indexOf(card);
	const next = list[index + by];
	if (!next) return;
	if (by < 0) next.before(card);
	else next.after(card);
	renumber(form);
}

function renumber(form: HTMLFormElement): void {
	const cards = [...form.querySelectorAll<HTMLElement>("[data-product]")];
	cards.forEach((card, index) => {
		const n = index + 1;
		const legend = card.querySelector("[data-legend]");
		const name = card.querySelector<HTMLInputElement>("[data-name]")?.value ?? "";
		if (legend) legend.textContent = `Produto ${n}${name ? `: ${name}` : ""}`;
		const up = card.querySelector<HTMLButtonElement>("[data-up]");
		const down = card.querySelector<HTMLButtonElement>("[data-down]");
		const remove = card.querySelector<HTMLButtonElement>("[data-remove-product]");
		if (up) {
			up.disabled = index === 0;
			up.setAttribute("aria-label", `Subir produto ${n}`);
		}
		if (down) {
			down.disabled = index === cards.length - 1;
			down.setAttribute("aria-label", `Descer produto ${n}`);
		}
		if (remove) {
			remove.disabled = cards.length === 1;
			remove.setAttribute("aria-label", `Remover produto ${n}`);
		}
	});
}

/** Wires the product-list form: reorder, rows and save. */
export function initProductEditor(form: HTMLFormElement): void {
	const isNew = form.dataset.new === "true";
	let saving = false;
	const stored = takeNotice();
	if (stored) show(form, [], stored);
	for (const card of form.querySelectorAll<HTMLElement>("[data-product]")) bindCard(card, form);
	renumber(form);

	form.querySelector("[data-add-product]")?.addEventListener("click", () => {
		const template = form.querySelector<HTMLTemplateElement>("#product-row");
		const host = form.querySelector("[data-products]");
		const card = template?.content.firstElementChild?.cloneNode(true);
		if (!(card instanceof HTMLElement) || !host) return;
		host.append(card);
		bindCard(card, form);
		bindImageFields(card);
		renumber(form);
	});

	const setSaving = (value: boolean): void => {
		saving = value;
		for (const button of form.querySelectorAll<HTMLButtonElement>("[data-save], [data-delete]")) {
			button.disabled = value;
			if (button.hasAttribute("data-save")) button.textContent = value ? "Salvando..." : "Salvar";
		}
	};

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		if (saving) return;
		setSaving(true);
		show(form, [], "");
		const products = [...form.querySelectorAll<HTMLElement>("[data-product]")].map(readProduct);
		try {
			if (isNew) {
				const name = form.querySelector<HTMLInputElement>("#list-name")?.value ?? "";
				await api("POST", "/products", { name, products });
				location.assign(`/admin/products/${name}`);
				return;
			}
			const saved = await api<{ sha: string }>("PUT", `/products/${form.dataset.name}`, {
				sha: form.dataset.sha,
				products,
			});
			form.dataset.sha = saved.sha;
			rememberNotice("Lista salva.");
			location.reload();
		} catch (cause) {
			show(form, messagesOf(cause), "");
			setSaving(false);
		}
	});

	form.querySelector("[data-delete]")?.addEventListener("click", async () => {
		const cards = form.querySelectorAll("[data-product]").length;
		const count = cards === 1 ? "1 produto" : `${cards} produtos`;
		const used = form.dataset.used ?? "";
		const posts = used
			? ` Os posts que usam a lista (${used}) perdem os cartões de produtos e viram rascunho.`
			: "";
		if (
			!confirm(
				`Excluir a lista "${form.dataset.name}" com ${count}?${posts} Esta ação não pode ser desfeita pelo painel.`,
			)
		)
			return;
		setSaving(true);
		show(form, [], "");
		try {
			await api("DELETE", `/products/${form.dataset.name}?sha=${form.dataset.sha ?? ""}`);
			location.assign("/admin/products");
		} catch (cause) {
			show(form, messagesOf(cause), "");
			setSaving(false);
		}
	});
}
