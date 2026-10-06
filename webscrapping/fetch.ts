/** A fetch refused or failed. `message` is in Portuguese because it is shown to the editor. */
export class FetchError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "FetchError";
	}
}

export type FetchLimits = {
	/** Exact host names the request (and every redirect) may reach. */
	allowedHosts: readonly string[];
	maxBytes: number;
	timeoutMs?: number;
};

// Honest identification: the source site can see who is reading and why, and block it if it wants.
const USER_AGENT = "sveltekit-blog-cms-import/1.0 (admin-triggered post import; one page per request)";
const MAX_REDIRECTS = 3;

/** True for an `https` URL whose host is on the list. Anything else must not be fetched by the server. */
export function isAllowedUrl(value: string, allowedHosts: readonly string[]): boolean {
	try {
		const url = new URL(value);
		// A custom port or credentials would reach a different service than the one that was allowed.
		return (
			url.protocol === "https:" &&
			url.port === "" &&
			url.username === "" &&
			url.password === "" &&
			allowedHosts.includes(url.hostname)
		);
	} catch {
		return false;
	}
}

/**
 * Downloads a URL typed by an admin or found in a scraped page (an SSRF surface), so:
 * only allowed https hosts, redirects re-checked one by one, a timeout and a size cap.
 */
export async function fetchLimited(url: string, limits: FetchLimits): Promise<Uint8Array> {
	const signal = AbortSignal.timeout(limits.timeoutMs ?? 10_000);
	let current = url;

	try {
		for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
			if (!isAllowedUrl(current, limits.allowedHosts))
				throw new FetchError(`Endereço não permitido: ${current}`);

			const response = await fetch(current, {
				redirect: "manual",
				signal,
				headers: { "User-Agent": USER_AGENT, Accept: "text/html,image/*;q=0.9,*/*;q=0.5" },
			});

			const location = response.headers.get("location");
			if (response.status >= 300 && response.status < 400 && location) {
				current = new URL(location, current).href;
				continue;
			}
			if (!response.ok) throw new FetchError(`A origem respondeu ${response.status} para ${current}`);

			return await readCapped(response, limits.maxBytes, current);
		}
		throw new FetchError(`Redirecionamentos demais a partir de ${url}`);
	} catch (error) {
		if (error instanceof FetchError) throw error;
		const reason =
			error instanceof Error && error.name === "TimeoutError" ? "tempo esgotado" : "falha de rede";
		throw new FetchError(`Não foi possível baixar ${current} (${reason}).`);
	}
}

async function readCapped(response: Response, maxBytes: number, url: string): Promise<Uint8Array> {
	const tooBig = new FetchError(`A resposta de ${url} passa do limite de ${maxBytes} bytes.`);
	// The header can lie or be absent, so the stream is counted as well.
	if (Number(response.headers.get("content-length") ?? 0) > maxBytes) throw tooBig;
	if (!response.body) return new Uint8Array();

	const chunks: Uint8Array[] = [];
	let total = 0;
	const reader = response.body.getReader();
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > maxBytes) {
			await reader.cancel();
			throw tooBig;
		}
		chunks.push(value);
	}

	const bytes = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		bytes.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return bytes;
}
