import { createVerify, generateKeyPairSync } from "node:crypto";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
	ANALYTICS_URL,
	analyticsReport,
	GoogleError,
	googleCredentials,
	SEARCH_CONSOLE_URL,
	searchConsoleReport,
	submitSitemap,
	TOKEN_URL,
} from "./google.ts";

const { privateKey, publicKey } = generateKeyPairSync("rsa", {
	modulusLength: 2048,
	privateKeyEncoding: { type: "pkcs8", format: "pem" },
	publicKeyEncoding: { type: "spki", format: "pem" },
});

// The token is cached per account, so each test signs in as a different one.
let account = 0;
const credentials = () => ({ clientEmail: `bot${++account}@project.iam.gserviceaccount.com`, privateKey });

type Call = { url: string; method: string; body: string; authorization: string | null };

/** Replaces `fetch`: the token endpoint always answers, the rest comes from `answer`. */
function fakeGoogle(answer: (call: Call) => Response) {
	const calls: Call[] = [];
	vi.stubGlobal("fetch", async (input: string | URL, init: RequestInit = {}) => {
		const call = {
			url: String(input),
			method: init.method ?? "GET",
			body: String(init.body ?? ""),
			authorization: new Headers(init.headers).get("authorization"),
		};
		calls.push(call);
		if (call.url === TOKEN_URL) return Response.json({ access_token: "token-1", expires_in: 3600 });
		return answer(call);
	});
	return calls;
}

afterEach(() => vi.unstubAllGlobals());

describe("googleCredentials", () => {
	it("needs both values and restores the line breaks of the key", () => {
		expect(googleCredentials("bot@x", undefined)).toBeUndefined();
		expect(googleCredentials(undefined, "key")).toBeUndefined();
		expect(googleCredentials("bot@x", "a\\nb")).toEqual({ clientEmail: "bot@x", privateKey: "a\nb" });
	});
});

describe("searchConsoleReport", () => {
	it("signs in with a JWT of the service account and reads totals, queries, pages and sitemaps", async () => {
		const account = credentials();
		const calls = fakeGoogle(({ url, body }) => {
			if (url.endsWith("/sitemaps"))
				return Response.json({
					sitemap: [
						{
							path: "https://example.com/sitemap.xml",
							lastSubmitted: "2026-10-01T10:00:00.000Z",
							isPending: false,
							errors: "0",
							warnings: "2",
							contents: [{ type: "web", submitted: "70" }],
						},
					],
				});
			const { dimensions } = JSON.parse(body) as { dimensions: string[] };
			if (dimensions.length === 0)
				return Response.json({
					rows: [{ clicks: 120, impressions: 4000, ctr: 0.03, position: 12.4 }],
				});
			return Response.json({
				rows: [{ keys: [`top ${dimensions[0]}`], clicks: 9, impressions: 90, ctr: 0.1, position: 3 }],
			});
		});

		const report = await searchConsoleReport(
			account,
			"sc-domain:example.com",
			new Date("2026-10-07T12:00:00Z"),
		);

		expect(report.totals).toEqual({ clicks: 120, impressions: 4000, ctr: 0.03, position: 12.4 });
		expect(report.queries).toEqual([
			{ key: "top query", clicks: 9, impressions: 90, ctr: 0.1, position: 3 },
		]);
		expect(report.pages[0]?.key).toBe("top page");
		expect(report.sitemaps).toEqual([
			{
				path: "https://example.com/sitemap.xml",
				lastSubmitted: "2026-10-01T10:00:00.000Z",
				lastDownloaded: null,
				pending: false,
				errors: 0,
				warnings: 2,
				submitted: 70,
			},
		]);

		// One token for the four API calls, each sent as the bearer.
		const [token, ...api] = calls;
		expect(calls.filter((call) => call.url === TOKEN_URL)).toHaveLength(1);
		expect(api).toHaveLength(4);
		expect(api.every((call) => call.authorization === "Bearer token-1")).toBe(true);
		expect(api[0]?.url).toBe(`${SEARCH_CONSOLE_URL}/sc-domain%3Aexample.com/searchAnalytics/query`);
		expect(JSON.parse(api[0]?.body ?? "")).toMatchObject({
			startDate: "2026-09-09",
			endDate: "2026-10-07",
		});

		const [header, payload, signature] =
			new URLSearchParams(token?.body).get("assertion")?.split(".") ?? [];
		expect(
			createVerify("RSA-SHA256")
				.update(`${header}.${payload}`)
				.verify(publicKey, signature ?? "", "base64url"),
		).toBe(true);
		expect(JSON.parse(Buffer.from(payload ?? "", "base64url").toString())).toMatchObject({
			iss: account.clientEmail,
			aud: TOKEN_URL,
			scope: expect.stringContaining("auth/webmasters"),
		});
	});

	it("returns an empty report for a property without data", async () => {
		fakeGoogle(() => Response.json({}));

		expect(await searchConsoleReport(credentials(), "https://example.com/")).toEqual({
			totals: { clicks: 0, impressions: 0, ctr: 0, position: 0 },
			queries: [],
			pages: [],
			sitemaps: [],
		});
	});

	it("reports the reason Google gave when access is refused", async () => {
		fakeGoogle(() =>
			Response.json(
				{ error: { message: "User does not have sufficient permission" } },
				{ status: 403 },
			),
		);

		await expect(searchConsoleReport(credentials(), "sc-domain:example.com")).rejects.toThrow(
			/403: User does not have sufficient permission/,
		);
	});

	it("fails with a clear message when the key is not a private key or the network is down", async () => {
		const calls = fakeGoogle(() => Response.json({}));
		await expect(
			searchConsoleReport({ clientEmail: "bad@x", privateKey: "not a key" }, "sc-domain:example.com"),
		).rejects.toThrow(/GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY/);
		expect(calls).toHaveLength(0);

		vi.stubGlobal("fetch", async () => {
			throw new TypeError("fetch failed");
		});
		await expect(searchConsoleReport(credentials(), "sc-domain:example.com")).rejects.toBeInstanceOf(
			GoogleError,
		);
	});
});

describe("submitSitemap", () => {
	it("PUTs the sitemap URL under the property", async () => {
		const calls = fakeGoogle(() => new Response(null, { status: 204 }));

		await submitSitemap(credentials(), "https://example.com/", "https://example.com/sitemap.xml");

		expect(calls[1]).toMatchObject({
			method: "PUT",
			url: `${SEARCH_CONSOLE_URL}/https%3A%2F%2Fexample.com%2F/sitemaps/https%3A%2F%2Fexample.com%2Fsitemap.xml`,
		});
	});
});

describe("analyticsReport", () => {
	it("reads the totals and the most viewed pages in one batch", async () => {
		const calls = fakeGoogle(() =>
			Response.json({
				reports: [
					{ rows: [{ metricValues: [{ value: "300" }, { value: "420" }, { value: "900" }] }] },
					{
						rows: [
							{
								dimensionValues: [{ value: "/melhor-air-fryer" }],
								metricValues: [{ value: "150" }, { value: "80" }],
							},
						],
					},
				],
			}),
		);

		expect(await analyticsReport(credentials(), "123456789")).toEqual({
			totals: { users: 300, sessions: 420, views: 900 },
			pages: [{ path: "/melhor-air-fryer", views: 150, users: 80 }],
		});
		expect(calls[1]?.url).toBe(`${ANALYTICS_URL}/123456789:batchRunReports`);
	});

	it("returns zeros for a property without visits", async () => {
		fakeGoogle(() => Response.json({ reports: [{}, {}] }));

		expect(await analyticsReport(credentials(), "123456789")).toEqual({
			totals: { users: 0, sessions: 0, views: 0 },
			pages: [],
		});
	});
});
