import { createHash, timingSafeEqual } from "node:crypto";
import { json } from "@sveltejs/kit";
import type { z } from "zod";
import { site } from "#lib/site.config.ts";
import type { AdminUser } from "./auth.ts";
import { type Author, NotFoundError, ValidationError } from "./cms.ts";
import { ConflictError, StoreFailedError, StoreUnavailableError } from "./store/types.ts";

/** Every error of the REST API has this body, whatever the endpoint. */
export type ApiErrorBody = { error: { code: string; message: string; details?: string[] } };

export class ApiError extends Error {
	constructor(
		readonly status: number,
		readonly code: string,
		message: string,
		readonly details?: string[],
	) {
		super(message);
		this.name = "ApiError";
	}
}

export function fail(status: number, code: string, message: string, details?: string[]): Response {
	const body: ApiErrorBody = { error: { code, message, ...(details ? { details } : {}) } };
	return json(body, { status });
}

/** Runs a handler and turns every known failure into the single error format. */
export async function respond(run: () => Response | Promise<Response>): Promise<Response> {
	try {
		return await run();
	} catch (error) {
		if (error instanceof ApiError) return fail(error.status, error.code, error.message, error.details);
		if (error instanceof ValidationError)
			return fail(400, "validation_failed", "The content is not valid", error.issues);
		if (error instanceof NotFoundError) return fail(404, "not_found", error.message);
		if (error instanceof ConflictError) return fail(409, "conflict", error.message);
		if (error instanceof StoreUnavailableError) {
			console.error("[api] content store unavailable", error.cause);
			return fail(503, "content_store_unavailable", error.message);
		}

		if (error instanceof StoreFailedError) {
			console.error("[api] content store failed", error.message);
			return fail(502, "content_store_failed", "GitHub is failing to store content", [
				`O GitHub respondeu erro ${error.status} ao gravar o conteúdo, mesmo depois de novas tentativas. O problema é do lado do GitHub: tente de novo em alguns minutos.`,
			]);
		}

		console.error("[api] unexpected error", error);
		return fail(500, "internal_error", "Unexpected error");
	}
}

/** The commit author for a write, or a 401 when nobody is signed in. */
export function requireAdmin(locals: { admin: AdminUser | null }): Author {
	if (!locals.admin) throw new ApiError(401, "unauthorized", "Sign in as an admin to use this endpoint");
	// The GitHub noreply address: content commits are public and must not carry the private e-mail of the account.
	// Someone who signed in with Google has no GitHub username, so their commits are signed by the site.
	const { name, githubLogin } = locals.admin;
	return { name, email: `${githubLogin ?? new URL(site.url).hostname}@users.noreply.github.com` };
}

export function parse<T>(schema: z.ZodType<T>, value: unknown): T {
	const result = schema.safeParse(value);
	if (result.success) return result.data;
	throw new ApiError(
		400,
		"invalid_request",
		"The request is not valid",
		result.error.issues.map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`),
	);
}

export const parseQuery = <T>(schema: z.ZodType<T>, url: URL): T =>
	parse(schema, Object.fromEntries(url.searchParams));

export const parseBody = async <T>(schema: z.ZodType<T>, request: Request): Promise<T> =>
	parse(schema, await request.json().catch(() => null));

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Compares two secrets in constant time. Hashing first gives both sides the length timingSafeEqual requires. */
export const safeEqual = (a: string, b: string): boolean => timingSafeEqual(digest(a), digest(b));

const hits = new Map<string, { count: number; resetAt: number }>();

/**
 * Fixed-window counter. Returns the seconds to wait when `key` is over `limit`, or 0 when the request may go on.
 * ponytail: lives in the memory of one server instance, so serverless instances count separately.
 * Move it to the database or to the platform firewall if abuse shows up.
 */
export function rateLimit(key: string, limit: number, windowMs: number, now = Date.now()): number {
	// Expired windows are dropped on the way so the map does not grow with one-off visitors.
	if (hits.size > 5000) for (const [k, hit] of hits) if (hit.resetAt <= now) hits.delete(k);

	const hit = hits.get(key);
	if (!hit || hit.resetAt <= now) {
		hits.set(key, { count: 1, resetAt: now + windowMs });
		return 0;
	}
	hit.count += 1;
	return hit.count > limit ? Math.ceil((hit.resetAt - now) / 1000) : 0;
}
