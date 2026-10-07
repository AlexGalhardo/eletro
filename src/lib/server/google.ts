import { createSign } from "node:crypto";

/** Service account that was given access to the Search Console property and to the Analytics property. */
export type GoogleCredentials = { clientEmail: string; privateKey: string };

/** A call to Google failed. `message` is in Portuguese because it is shown to the admin. */
export class GoogleError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "GoogleError";
	}
}

export const TOKEN_URL = "https://oauth2.googleapis.com/token";
export const SEARCH_CONSOLE_URL = "https://www.googleapis.com/webmasters/v3/sites";
export const ANALYTICS_URL = "https://analyticsdata.googleapis.com/v1beta/properties";
// `webmasters` (not `.readonly`) because submitting a sitemap is a write.
const SCOPE = "https://www.googleapis.com/auth/webmasters https://www.googleapis.com/auth/analytics.readonly";
const TIMEOUT_MS = 15_000;
/** Both reports cover this many days, ending today. */
export const REPORT_DAYS = 28;

/** The credentials when both variables are set. Hosting panels store the key with literal `\n`. */
export function googleCredentials(
	clientEmail: string | undefined,
	privateKey: string | undefined,
): GoogleCredentials | undefined {
	if (!clientEmail || !privateKey) return undefined;
	return { clientEmail, privateKey: privateKey.replace(/\\n/g, "\n") };
}

const base64url = (value: string | Buffer) => Buffer.from(value).toString("base64url");

// ponytail: per server instance; a cold serverless start asks for a new token, which is one extra request.
const tokens = new Map<string, { token: string; expiresAt: number }>();

/** Trades a JWT signed with the service account key for an access token (valid for one hour, cached). */
async function accessToken(credentials: GoogleCredentials, now = Date.now()): Promise<string> {
	const cached = tokens.get(credentials.clientEmail);
	if (cached && cached.expiresAt > now + 60_000) return cached.token;

	const seconds = Math.floor(now / 1000);
	const unsigned = `${base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }))}.${base64url(
		JSON.stringify({
			iss: credentials.clientEmail,
			scope: SCOPE,
			aud: TOKEN_URL,
			iat: seconds,
			exp: seconds + 3600,
		}),
	)}`;
	let signature: string;
	try {
		signature = createSign("RSA-SHA256").update(unsigned).sign(credentials.privateKey, "base64url");
	} catch {
		throw new GoogleError(
			"GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY não é uma chave privada válida. Copie o campo private_key do JSON da conta de serviço, inteiro.",
		);
	}

	const body = await send<{ access_token: string; expires_in: number }>(TOKEN_URL, {
		method: "POST",
		headers: { "Content-Type": "application/x-www-form-urlencoded" },
		body: new URLSearchParams({
			grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
			assertion: `${unsigned}.${signature}`,
		}),
	});
	tokens.set(credentials.clientEmail, {
		token: body.access_token,
		expiresAt: now + body.expires_in * 1000,
	});
	return body.access_token;
}

async function send<T>(url: string, init: RequestInit): Promise<T> {
	let response: Response;
	try {
		response = await fetch(url, { ...init, signal: AbortSignal.timeout(TIMEOUT_MS) });
	} catch {
		throw new GoogleError("Não foi possível falar com o Google (tempo esgotado ou falha de rede).");
	}
	const text = await response.text();
	let body: unknown;
	try {
		body = text ? JSON.parse(text) : undefined;
	} catch {
		body = undefined;
	}
	if (!response.ok) {
		// The token endpoint answers `error_description`; the APIs answer `error.message`.
		const { error, error_description } = (body ?? {}) as {
			error?: { message?: string } | string;
			error_description?: string;
		};
		const reason = error_description ?? (typeof error === "object" ? error.message : error) ?? "";
		throw new GoogleError(`O Google respondeu ${response.status}${reason ? `: ${reason}` : "."}`);
	}
	return body as T;
}

async function call<T>(
	credentials: GoogleCredentials,
	url: string,
	method = "GET",
	body?: unknown,
): Promise<T> {
	return send<T>(url, {
		method,
		headers: {
			Authorization: `Bearer ${await accessToken(credentials)}`,
			...(body === undefined ? {} : { "Content-Type": "application/json" }),
		},
		body: body === undefined ? undefined : JSON.stringify(body),
	});
}

export type SearchRow = { key: string; clicks: number; impressions: number; ctr: number; position: number };
export type SitemapStatus = {
	path: string;
	lastSubmitted: string | null;
	lastDownloaded: string | null;
	pending: boolean;
	errors: number;
	warnings: number;
	/** URLs listed in the sitemap, as counted by Google. */
	submitted: number;
};
export type SearchConsoleReport = {
	totals: Omit<SearchRow, "key">;
	queries: SearchRow[];
	pages: SearchRow[];
	sitemaps: SitemapStatus[];
};

const isoDay = (date: Date) => date.toISOString().slice(0, 10);

/**
 * Search performance of the last 28 days and the sitemaps Google knows for the property.
 * `property` is the Search Console name: `sc-domain:example.com` or `https://example.com/`.
 */
export async function searchConsoleReport(
	credentials: GoogleCredentials,
	property: string,
	now = new Date(),
): Promise<SearchConsoleReport> {
	type Rows = {
		rows?: { keys?: string[]; clicks: number; impressions: number; ctr: number; position: number }[];
	};
	type Sitemaps = {
		sitemap?: {
			path: string;
			lastSubmitted?: string;
			lastDownloaded?: string;
			isPending?: boolean;
			errors?: string;
			warnings?: string;
			contents?: { submitted?: string }[];
		}[];
	};

	const base = `${SEARCH_CONSOLE_URL}/${encodeURIComponent(property)}`;
	const range = {
		startDate: isoDay(new Date(now.getTime() - REPORT_DAYS * 86_400_000)),
		endDate: isoDay(now),
	};
	const query = (dimensions: string[]) =>
		call<Rows>(credentials, `${base}/searchAnalytics/query`, "POST", {
			...range,
			dimensions,
			rowLimit: 10,
		});
	// The first call fetches the token; the others reuse it.
	const totals = await query([]);
	const [queries, pages, sitemaps] = await Promise.all([
		query(["query"]),
		query(["page"]),
		call<Sitemaps>(credentials, `${base}/sitemaps`),
	]);

	const rows = (result: Rows): SearchRow[] =>
		(result.rows ?? []).map(({ keys, clicks, impressions, ctr, position }) => ({
			key: keys?.[0] ?? "",
			clicks,
			impressions,
			ctr,
			position,
		}));
	const { clicks = 0, impressions = 0, ctr = 0, position = 0 } = totals.rows?.[0] ?? {};
	return {
		totals: { clicks, impressions, ctr, position },
		queries: rows(queries),
		pages: rows(pages),
		sitemaps: (sitemaps.sitemap ?? []).map((item) => ({
			path: item.path,
			lastSubmitted: item.lastSubmitted ?? null,
			lastDownloaded: item.lastDownloaded ?? null,
			pending: item.isPending ?? false,
			errors: Number(item.errors ?? 0),
			warnings: Number(item.warnings ?? 0),
			submitted: (item.contents ?? []).reduce(
				(sum, content) => sum + Number(content.submitted ?? 0),
				0,
			),
		})),
	};
}

/** Submits (or resubmits) a sitemap, which asks Google to read it again. */
export async function submitSitemap(
	credentials: GoogleCredentials,
	property: string,
	sitemapUrl: string,
): Promise<void> {
	await call(
		credentials,
		`${SEARCH_CONSOLE_URL}/${encodeURIComponent(property)}/sitemaps/${encodeURIComponent(sitemapUrl)}`,
		"PUT",
	);
}

export type AnalyticsReport = {
	totals: { users: number; sessions: number; views: number };
	pages: { path: string; views: number; users: number }[];
};

/** Visitors of the last 28 days from Google Analytics 4. `propertyId` is the numeric id of the property. */
export async function analyticsReport(
	credentials: GoogleCredentials,
	propertyId: string,
): Promise<AnalyticsReport> {
	type Report = { rows?: { dimensionValues?: { value: string }[]; metricValues: { value: string }[] }[] };

	const dateRanges = [{ startDate: `${REPORT_DAYS}daysAgo`, endDate: "today" }];
	const { reports = [] } = await call<{ reports?: Report[] }>(
		credentials,
		`${ANALYTICS_URL}/${encodeURIComponent(propertyId)}:batchRunReports`,
		"POST",
		{
			requests: [
				{
					dateRanges,
					metrics: [{ name: "activeUsers" }, { name: "sessions" }, { name: "screenPageViews" }],
				},
				{
					dateRanges,
					dimensions: [{ name: "pagePath" }],
					metrics: [{ name: "screenPageViews" }, { name: "activeUsers" }],
					orderBys: [{ metric: { metricName: "screenPageViews" }, desc: true }],
					limit: 10,
				},
			],
		},
	);

	const value = (row: NonNullable<Report["rows"]>[number] | undefined, index: number) =>
		Number(row?.metricValues[index]?.value ?? 0);
	const total = reports[0]?.rows?.[0];
	return {
		totals: { users: value(total, 0), sessions: value(total, 1), views: value(total, 2) },
		pages: (reports[1]?.rows ?? []).map((row) => ({
			path: row.dimensionValues?.[0]?.value ?? "",
			views: value(row, 0),
			users: value(row, 1),
		})),
	};
}
