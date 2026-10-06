import { createHash, timingSafeEqual } from "node:crypto";
import { error, json } from "@sveltejs/kit";
import { z } from "zod";
import { testLogin, testLoginToken } from "#lib/server/auth.ts";

const bodySchema = z.object({ token: z.string().min(1), githubLogin: z.string().min(1) });

const digest = (value: string) => createHash("sha256").update(value).digest();

/** Session shortcut for automated tests. It does not exist unless AUTH_TEST_LOGIN_TOKEN is set, and never in production. */
export async function POST({ request }) {
	const expected = testLoginToken();
	if (!expected) error(404, "Not found");

	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	// Hashing first gives both sides the same length, which timingSafeEqual requires.
	if (!parsed.success || !timingSafeEqual(digest(parsed.data.token), digest(expected))) {
		return json(
			{ error: { code: "unauthorized", message: "Invalid test login token" } },
			{ status: 401 },
		);
	}

	const cookie = await testLogin(parsed.data.githubLogin);
	if (!cookie) {
		return json({ error: { code: "forbidden", message: "User is not an admin" } }, { status: 403 });
	}

	const secure = cookie.startsWith("__Secure-") ? "; Secure" : "";
	return json(
		{ success: true },
		{ headers: { "set-cookie": `${cookie}; Path=/; HttpOnly; SameSite=Lax${secure}` } },
	);
}
