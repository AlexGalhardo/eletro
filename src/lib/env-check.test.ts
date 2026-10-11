import { describe, expect, it } from "vitest";
import { ESSENTIAL_IN_PRODUCTION, envProblems } from "./env-check.ts";

const GOOGLE_SECRET = `GOCSPX-${"a".repeat(28)}`;

const production = {
	LINKS_DASHBOARD_TOKEN: "links-token",
	DATABASE_URL: "postgresql://user:password@host.example.com/db?sslmode=require",
	BETTER_AUTH_SECRET: "0123456789abcdef0123456789abcdef",
	BETTER_AUTH_URL: "https://example.com",
	GITHUB_TOKEN: "github-token",
	GITHUB_REPO: "owner/name",
	CRON_SECRET: "fedcba9876543210fedcba9876543210",
	GOOGLE_CLIENT_ID: "123-abc.apps.googleusercontent.com",
	GOOGLE_CLIENT_SECRET: GOOGLE_SECRET,
	ADMIN_EMAILS: "owner@example.com, second@example.com",
};

const without = (...names: (keyof typeof production)[]) =>
	Object.fromEntries(Object.entries(production).filter(([name]) => !names.includes(name as never)));

describe("envProblems outside production", () => {
	it("accepts an empty environment and blank variables", () => {
		expect(envProblems({}, false)).toEqual([]);
		expect(envProblems({ DATABASE_URL: "", ADMIN_EMAILS: "  ", GOOGLE_CLIENT_ID: "" }, false)).toEqual(
			[],
		);
	});

	it("accepts the values of .env.example and of the e2e server", () => {
		const env = {
			RESEND_FROM_EMAIL: "My Blog <no-reply@example.com>",
			BETTER_AUTH_URL: "http://127.0.0.1:4173",
			BETTER_AUTH_SECRET: "e2e-only-secret-0123456789abcdef0123456789",
			ADMIN_GITHUB_USERS: "e2e-admin",
			PGLITE_DIR: "memory://",
		};
		expect(envProblems(env, false)).toEqual([]);
	});

	it("reports a variable that is present but malformed, by name and without its value", () => {
		const env = {
			DATABASE_URL: "mysql://secret-host/db",
			BETTER_AUTH_SECRET: "too-short-secret",
			BETTER_AUTH_URL: "my-site.dev",
			ADMIN_EMAILS: "owner@example.com, not-an-email",
			ADMIN_GITHUB_USERS: "octo admin",
			GOOGLE_CLIENT_ID: "client-id",
			GOOGLE_CLIENT_SECRET: "GOCSPX-short",
			GITHUB_REPO: "just-a-name",
			CRON_SECRET: "short-cron",
			CONTACT_TO_EMAIL: "nobody",
			RESEND_FROM_EMAIL: "My Blog",
			GOOGLE_SERVICE_ACCOUNT_EMAIL: "robot",
			GOOGLE_SEARCH_CONSOLE_SITE: "my-site.dev",
			GOOGLE_ANALYTICS_PROPERTY_ID: "G-ABC123",
		};
		const problems = envProblems(env, false);

		expect(problems.map((problem) => problem.split(":")[0]).sort()).toEqual(Object.keys(env).sort());
		for (const value of Object.values(env))
			for (const problem of problems) expect(problem).not.toContain(value);
	});

	it("reports a login provider configured by half", () => {
		expect(envProblems({ GITHUB_CLIENT_ID: "id" }, false)).toEqual([
			"GITHUB_CLIENT_SECRET: falta; GITHUB_CLIENT_ID está definida sem o seu par",
		]);
		expect(envProblems({ GOOGLE_CLIENT_SECRET: GOOGLE_SECRET }, false)).toEqual([
			"GOOGLE_CLIENT_ID: falta; GOOGLE_CLIENT_SECRET está definida sem o seu par",
		]);
	});

	it("accepts both forms of the Search Console property and of the sender", () => {
		for (const GOOGLE_SEARCH_CONSOLE_SITE of ["sc-domain:example.com", "https://example.com/"])
			expect(envProblems({ GOOGLE_SEARCH_CONSOLE_SITE }, false)).toEqual([]);
		for (const RESEND_FROM_EMAIL of ["no-reply@example.com", "Blog <no-reply@example.com>"])
			expect(envProblems({ RESEND_FROM_EMAIL }, false)).toEqual([]);
	});
});

describe("envProblems in a production build", () => {
	it("accepts a complete environment, with either login provider", () => {
		expect(envProblems(production, true)).toEqual([]);
		expect(
			envProblems(
				{
					...without("GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET", "ADMIN_EMAILS"),
					GITHUB_CLIENT_ID: "id",
					GITHUB_CLIENT_SECRET: "secret",
					ADMIN_GITHUB_USERS: "octo-admin",
				},
				true,
			),
		).toEqual([]);
	});

	it("requires every essential variable, blank ones included", () => {
		for (const name of ESSENTIAL_IN_PRODUCTION) {
			const expected = [`${name}: obrigatória no build de produção`];
			expect(envProblems(without(name as keyof typeof production), true), name).toEqual(expected);
			expect(envProblems({ ...production, [name]: " " }, true), name).toEqual(expected);
		}
	});

	it("lists every problem of an empty environment", () => {
		const problems = envProblems({}, true);

		expect(problems).toHaveLength(ESSENTIAL_IN_PRODUCTION.length + 2);
		expect(problems.join("\n")).toContain("produção precisa de um par completo de login");
		expect(problems.join("\n")).toContain("produção precisa de ao menos uma lista de admins");
	});

	it("requires a complete login provider and an allow list", () => {
		expect(envProblems(without("GOOGLE_CLIENT_SECRET"), true)).toEqual([
			"GOOGLE_CLIENT_SECRET: falta; GOOGLE_CLIENT_ID está definida sem o seu par",
			"GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET ou GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET: " +
				"produção precisa de um par completo de login",
		]);
		expect(envProblems(without("ADMIN_EMAILS"), true)).toEqual([
			"ADMIN_EMAILS ou ADMIN_GITHUB_USERS: produção precisa de ao menos uma lista de admins",
		]);
	});

	it("requires https for the public origin", () => {
		expect(envProblems({ ...production, BETTER_AUTH_URL: "http://example.com" }, true)).toEqual([
			"BETTER_AUTH_URL: deve usar https em produção",
		]);
	});
});
