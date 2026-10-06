import { getDb } from "#lib/server/db/index.ts";
import { confirm } from "#lib/server/newsletter.ts";

// The answer depends on the token of each visitor, so this page cannot be built ahead of time.
export const prerender = false;

export async function load({ url }) {
	return { confirmed: await confirm(await getDb(), url.searchParams.get("token") ?? "") };
}
