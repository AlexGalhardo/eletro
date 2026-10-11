// Build-time validation of the environment (scripts/check-env.ts). `src/env.ts` keeps every variable optional
// so a fresh clone runs with none; this module is what refuses a production build that could not work.
// Messages name the variable and never its value: build logs are read by more people than the secrets are.
import { z } from "zod";

const EMAIL = z.email();
const GITHUB_USER = /^[a-z\d](?:[a-z\d-]{0,38})$/i;
const SENDER = /^(?:[^<>]*<\s*)?[^\s<>@]+@[^\s<>@]+\.[^\s<>@]+(?:\s*>)?$/;

const items = (value: string) =>
	value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);

const emailList = z.string().refine((value) => items(value).every((item) => EMAIL.safeParse(item).success), {
	error: "deve ser uma lista de e-mails separados por vírgula",
});

const shape = {
	DATABASE_URL: z
		.string()
		.regex(/^postgres(?:ql)?:\/\/\S+$/, { error: "deve ser uma URL postgres:// ou postgresql://" }),
	BETTER_AUTH_SECRET: z.string().min(32, { error: "deve ter pelo menos 32 caracteres" }),
	BETTER_AUTH_URL: z.url({
		protocol: /^https?$/,
		error: "deve ser uma URL http(s), como https://example.com",
	}),
	GITHUB_CLIENT_ID: z.string(),
	GITHUB_CLIENT_SECRET: z.string(),
	ADMIN_GITHUB_USERS: z.string().refine((value) => items(value).every((item) => GITHUB_USER.test(item)), {
		error: "deve ser uma lista de usuários do GitHub separados por vírgula",
	}),
	GOOGLE_CLIENT_ID: z.string().regex(/^\S+\.apps\.googleusercontent\.com$/, {
		error: "deve terminar em .apps.googleusercontent.com",
	}),
	GOOGLE_CLIENT_SECRET: z.string().regex(/^GOCSPX-[A-Za-z0-9_-]{28}$/, {
		error: "deve ter o formato GOCSPX- seguido de 28 caracteres",
	}),
	ADMIN_EMAILS: emailList,
	GITHUB_TOKEN: z.string(),
	GITHUB_REPO: z.string().regex(/^[\w.-]+\/[\w.-]+$/, { error: 'deve ter o formato "dono/nome"' }),
	GITHUB_BRANCH: z.string().regex(/^\S+$/, { error: "não pode ter espaços" }),
	RESEND_FROM_EMAIL: z.string().regex(SENDER, { error: 'deve ser um e-mail ou "Nome <e-mail>"' }),
	CONTACT_TO_EMAIL: z.email({ error: "deve ser um e-mail" }),
	CRON_SECRET: z.string().min(32, { error: "deve ter pelo menos 32 caracteres" }),
	GOOGLE_SERVICE_ACCOUNT_EMAIL: z.email({ error: "deve ser um e-mail" }),
	GOOGLE_SEARCH_CONSOLE_SITE: z.string().regex(/^(?:sc-domain:\S+|https?:\/\/\S+)$/, {
		error: 'deve ser "sc-domain:example.com" ou "https://example.com/"',
	}),
	GOOGLE_ANALYTICS_PROPERTY_ID: z
		.string()
		.regex(/^\d+$/, { error: "deve ser o id numérico da propriedade (não o G-XXXX)" }),
	LINKS_DASHBOARD_TOKEN: z.string(),
};

type Name = keyof typeof shape;

const schema = z.object(shape).partial();

/** Without these a production deploy cannot publish, sign anyone in or run its scheduled jobs. */
export const ESSENTIAL_IN_PRODUCTION: readonly Name[] = [
	"LINKS_DASHBOARD_TOKEN",
	"DATABASE_URL",
	"BETTER_AUTH_SECRET",
	"BETTER_AUTH_URL",
	"GITHUB_TOKEN",
	"GITHUB_REPO",
	"CRON_SECRET",
];

const LOGIN_PAIRS: readonly (readonly [Name, Name])[] = [
	["GITHUB_CLIENT_ID", "GITHUB_CLIENT_SECRET"],
	["GOOGLE_CLIENT_ID", "GOOGLE_CLIENT_SECRET"],
];

/**
 * Everything wrong with the environment, one line per problem. A blank variable counts as missing. Outside
 * production nothing is required: a variable is only reported when it is present and malformed.
 */
export function envProblems(env: Record<string, string | undefined>, production: boolean): string[] {
	const has = (name: Name) => Boolean(env[name]?.trim());
	const present = Object.fromEntries(
		(Object.keys(shape) as Name[]).filter(has).map((name) => [name, env[name]?.trim()]),
	);

	const result = schema.safeParse(present);
	const problems = result.success
		? []
		: result.error.issues.map((issue) => `${String(issue.path[0])}: ${issue.message}`);

	for (const [id, secret] of LOGIN_PAIRS) {
		if (has(id) && !has(secret)) problems.push(`${secret}: falta; ${id} está definida sem o seu par`);
		if (has(secret) && !has(id)) problems.push(`${id}: falta; ${secret} está definida sem o seu par`);
	}

	if (!production) return problems;

	for (const name of ESSENTIAL_IN_PRODUCTION)
		if (!has(name)) problems.push(`${name}: obrigatória no build de produção`);

	if (has("BETTER_AUTH_URL") && !/^https:\/\//i.test(env.BETTER_AUTH_URL?.trim() ?? ""))
		problems.push("BETTER_AUTH_URL: deve usar https em produção");

	if (!LOGIN_PAIRS.some(([id, secret]) => has(id) && has(secret)))
		problems.push(
			"GITHUB_CLIENT_ID + GITHUB_CLIENT_SECRET ou GOOGLE_CLIENT_ID + GOOGLE_CLIENT_SECRET: " +
				"produção precisa de um par completo de login",
		);

	if (!has("ADMIN_EMAILS") && !has("ADMIN_GITHUB_USERS"))
		problems.push("ADMIN_EMAILS ou ADMIN_GITHUB_USERS: produção precisa de ao menos uma lista de admins");

	return problems;
}
