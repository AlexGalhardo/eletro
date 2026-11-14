import { createHash } from "node:crypto";

// Admin pages run with a restricted policy: no third-party script, and the only network the panel needs is the
// site itself and the GitHub API. Meta tags cannot set frame-ancestors; GitHub Pages cannot send headers.
const META = /<meta http-equiv="Content-Security-Policy" content="[^"]*"\s*\/?>/;
const INLINE_SCRIPT = /<script(?![^>]*\ssrc=)([^>]*)>([\s\S]*?)<\/script>/g;

/** Without hashes (dev server) inline scripts are allowed; the build swaps that for the hashes of the real ones. */
export function adminCsp(scriptHashes: string[] = []): string {
	const scripts =
		scriptHashes.length > 0 ? scriptHashes.map((hash) => `'${hash}'`).join(" ") : "'unsafe-inline'";
	return [
		"default-src 'self'",
		`script-src 'self' ${scripts}`,
		"style-src 'self' 'unsafe-inline'",
		"img-src 'self' data: blob: https:",
		"font-src 'self' data:",
		"connect-src 'self' https://api.github.com",
		"object-src 'none'",
		"base-uri 'none'",
		"form-action 'self'",
	].join("; ");
}

/** Hashes of the executable inline scripts of a built page. */
export function inlineScriptHashes(html: string): string[] {
	const hashes = new Set<string>();
	for (const [, attributes, body] of html.matchAll(INLINE_SCRIPT)) {
		if (/type="application\/(ld\+)?json"/.test(attributes ?? "")) continue;
		hashes.add(
			`sha256-${createHash("sha256")
				.update(body ?? "")
				.digest("base64")}`,
		);
	}
	return [...hashes];
}

/** Replaces the dev policy of a built admin page with one that lists exactly the page's inline scripts. */
export function sealAdminHtml(html: string): string {
	if (!META.test(html)) return html;
	return html.replace(
		META,
		() => `<meta http-equiv="Content-Security-Policy" content="${adminCsp(inlineScriptHashes(html))}">`,
	);
}
