/** A refused request, with the messages to show next to the form. */
export class RequestError extends Error {
	constructor(
		readonly status: number,
		readonly messages: string[],
	) {
		super(messages.join(" "));
		this.name = "RequestError";
	}
}

/** Calls the REST API as the signed-in admin and returns the `data` of the answer. */
export async function api<T = unknown>(method: string, path: string, body?: unknown): Promise<T> {
	const isForm = body instanceof FormData;
	const response = await fetch(`/api/v1${path}`, {
		method,
		headers: body === undefined || isForm ? undefined : { "Content-Type": "application/json" },
		body: body === undefined ? undefined : isForm ? body : JSON.stringify(body),
	});
	if (response.status === 204) return undefined as T;

	const payload = (await response.json().catch(() => null)) as {
		data?: T;
		error?: { code: string; message: string; details?: string[] };
	} | null;
	if (response.ok && payload) return payload.data as T;

	const messages: Record<number, string> = {
		401: "Sua sessão expirou. Entre de novo.",
		409: "Este conteúdo foi alterado por outra pessoa ou já existe. Recarregue a página e tente de novo.",
		429: "Muitas alterações em pouco tempo. Aguarde um minuto.",
		503: "O painel não consegue gravar neste servidor: faltam GITHUB_TOKEN e GITHUB_REPO nas variáveis de ambiente.",
	};
	throw new RequestError(
		response.status,
		payload?.error?.details ?? [messages[response.status] ?? "Não foi possível salvar. Tente de novo."],
	);
}

export const messagesOf = (error: unknown): string[] =>
	error instanceof RequestError
		? error.messages
		: ["Não foi possível falar com o servidor. Tente de novo."];

const NOTICE_KEY = "admin-notice";

/** Keeps a confirmation across the reload that replaces SvelteKit's invalidateAll. */
export function rememberNotice(message: string): void {
	try {
		sessionStorage.setItem(NOTICE_KEY, message);
	} catch {
		// Private mode still reloads; the confirmation is skipped.
	}
}

export function takeNotice(): string {
	try {
		const message = sessionStorage.getItem(NOTICE_KEY) ?? "";
		if (message) sessionStorage.removeItem(NOTICE_KEY);
		return message;
	} catch {
		return "";
	}
}

/** Uploads an image and returns its public URL. */
export async function uploadImage(file: File, folder: string): Promise<string> {
	const form = new FormData();
	form.set("file", file);
	form.set("folder", folder);
	return (await api<{ url: string }>("POST", "/media", form)).url;
}

/** Turns "Melhor Cafeteira 2026!" into "melhor-cafeteira-2026". */
export function slugify(text: string): string {
	return text
		.normalize("NFD")
		.replace(/[̀-ͯ]/g, "")
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, "-")
		.replace(/^-+|-+$/g, "")
		.slice(0, 96);
}

// Shared Tailwind classes of the dashboard forms.
export const ui = {
	label: "block text-sm font-semibold",
	input: "mt-1 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-black placeholder:text-gray-400 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/40 dark:border-zinc-700 dark:bg-zinc-900 dark:text-white",
	button: "inline-flex items-center justify-center gap-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-60 dark:border-zinc-700 dark:hover:bg-zinc-800",
	primary:
		"inline-flex items-center justify-center gap-1 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60",
	danger: "inline-flex items-center justify-center gap-1 rounded-lg border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:opacity-60 dark:border-red-900 dark:text-red-400 dark:hover:bg-red-950",
	card: "rounded-xl border border-gray-200 bg-white p-4 dark:border-zinc-800 dark:bg-zinc-950",
};
