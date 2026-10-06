import { getBundledListSources, getBundledPostSources } from "./content.ts";
import { blobSha, encode } from "./store/types.ts";

const versions = (sources: Map<string, string>) =>
	new Map([...sources].map(([name, raw]) => [name, blobSha(encode(raw))]));

let posts: Map<string, string> | undefined;
let lists: Map<string, string> | undefined;

/**
 * Whether the version `sha` of a file is the one compiled into the running deploy.
 * Comparing content hashes needs no call to the hosting platform and works the same on Vercel and Netlify.
 */
export function isPostDeployed(slug: string, sha: string): boolean {
	posts ??= versions(getBundledPostSources());
	return posts.get(slug) === sha;
}

export function isListDeployed(name: string, sha: string): boolean {
	lists ??= versions(getBundledListSources());
	return lists.get(name) === sha;
}
