import { z } from "zod";
import { safeEqual } from "#lib/server/api.ts";
import { testLogin, testLoginToken } from "#lib/server/auth.ts";
import { error, json } from "#lib/server/http.ts";

const bodySchema = z.object({ token: z.string().min(1), githubLogin: z.string().min(1) });

/** Session shortcut for automated tests. It does not exist unless AUTH_TEST_LOGIN_TOKEN is set, and never in production. */
export async function POST({ request }) {
	const expected = testLoginToken();
	if (!expected) error(404, "Not found");

	const parsed = bodySchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success || !safeEqual(parsed.data.token, expected)) {
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
