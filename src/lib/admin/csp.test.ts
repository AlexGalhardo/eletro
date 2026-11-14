import { createHash } from "node:crypto";
import { describe, expect, test } from "vitest";
import { adminCsp, inlineScriptHashes, sealAdminHtml } from "./csp.ts";

const hash = (body: string) => `sha256-${createHash("sha256").update(body).digest("base64")}`;
const page = (extra = "") =>
	`<head><meta http-equiv="Content-Security-Policy" content="${adminCsp()}"><script>a()</script><script type="module">b()</script><script type="module" src="/x.js"></script>${extra}</head>`;

describe("adminCsp", () => {
	test("allows only the site and the GitHub API on the network", () => {
		const csp = adminCsp(["sha256-x"]);
		expect(csp).toContain("default-src 'self'");
		expect(csp).toContain("connect-src 'self' https://api.github.com");
		expect(csp).toContain("object-src 'none'");
		expect(csp).not.toMatch(/googletagmanager|clarity|\*/);
		expect(csp).toContain("script-src 'self' 'sha256-x'");
		expect(csp).not.toContain("script-src 'self' 'unsafe-inline'");
	});

	test("falls back to inline scripts when there are no hashes (dev)", () => {
		expect(adminCsp()).toContain("script-src 'self' 'unsafe-inline'");
	});
});

describe("sealAdminHtml", () => {
	test("lists the hash of every inline script and none of the external ones", () => {
		const out = sealAdminHtml(page());
		expect(out).toContain(`'${hash("a()")}'`);
		expect(out).toContain(`'${hash("b()")}'`);
		expect(out).not.toContain("'unsafe-inline'; style");
		expect(inlineScriptHashes(page())).toHaveLength(2);
	});

	test("skips JSON data blocks and leaves pages without the meta alone", () => {
		expect(inlineScriptHashes('<script type="application/ld+json">{}</script>')).toEqual([]);
		expect(sealAdminHtml("<head></head>")).toBe("<head></head>");
	});
});
