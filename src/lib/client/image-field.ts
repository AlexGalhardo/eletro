import { messagesOf, uploadImage } from "#lib/admin/api.ts";

/** Binds upload and preview on every image field, including ones added after the first pass. */
export function bindImageFields(root: ParentNode = document): void {
	for (const field of root.querySelectorAll<HTMLElement>("[data-image-field]")) {
		if (field.dataset.bound === "image") continue;
		field.dataset.bound = "image";
		const url = field.querySelector<HTMLInputElement>("[data-image-url]");
		const file = field.querySelector<HTMLInputElement>("[data-image-file]");
		const preview = field.querySelector<HTMLImageElement>("[data-image-preview]");
		const broken = field.querySelector<HTMLElement>("[data-image-broken]");
		const error = field.querySelector<HTMLElement>("[data-image-error]");
		const label = field.querySelector<HTMLElement>("[data-image-button]");
		const folder = field.dataset.folder === "covers" ? "covers" : "posts";
		let sent: { url: string; preview: string } | undefined;

		const paint = (): void => {
			if (!url || !preview || !broken) return;
			const value = url.value;
			if (!value || broken.dataset.broken === value) {
				preview.hidden = true;
				broken.hidden = !value;
				return;
			}
			broken.hidden = true;
			preview.hidden = false;
			preview.src = sent?.url === value ? sent.preview : value;
		};

		url?.addEventListener("input", () => {
			if (broken) delete broken.dataset.broken;
			paint();
		});
		preview?.addEventListener("error", () => {
			if (!url || !broken || !preview) return;
			broken.dataset.broken = url.value;
			preview.hidden = true;
			broken.hidden = false;
		});
		file?.addEventListener("change", async () => {
			const chosen = file.files?.[0];
			if (!chosen || !url) return;
			if (label) label.textContent = "Enviando...";
			file.disabled = true;
			if (error) error.hidden = true;
			try {
				url.value = await uploadImage(chosen, folder);
				url.dispatchEvent(new Event("input", { bubbles: true }));
				if (sent) URL.revokeObjectURL(sent.preview);
				sent = { url: url.value, preview: URL.createObjectURL(chosen) };
				if (broken) delete broken.dataset.broken;
				paint();
			} catch (cause) {
				if (error) {
					error.hidden = false;
					error.textContent = messagesOf(cause).join(" ");
				}
			} finally {
				file.disabled = false;
				file.value = "";
				if (label) label.textContent = "Enviar";
			}
		});
		paint();
	}
}
