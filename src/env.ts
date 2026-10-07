import { defineEnvVars } from "@sveltejs/kit/env";

// Every variable is optional so a fresh clone runs with no configuration: the public site needs none,
// and each feature explains what is missing when it is used without its variables.
const optional = (value: string | undefined) => value?.trim() || undefined;

const list = (value: string | undefined) =>
	(value ?? "")
		.split(",")
		.map((item) => item.trim().toLowerCase())
		.filter(Boolean);

export const variables = defineEnvVars({
	// --- Database -----------------------------------------------------------
	DATABASE_URL: {
		schema: optional,
		description: "Postgres connection string (Neon). Without it, a local PGlite database is used.",
	},
	PGLITE_DIR: {
		schema: optional,
		description:
			'Folder of the local PGlite database. Defaults to ".data/pglite"; "memory://" keeps it in RAM.',
	},

	// --- Admin authentication ----------------------------------------------
	BETTER_AUTH_SECRET: {
		schema: optional,
		description: "Secret used to sign sessions. Generate with `openssl rand -base64 32`.",
	},
	BETTER_AUTH_URL: {
		schema: optional,
		description:
			"Public origin of the site, e.g. https://example.com. Inferred from the request when unset.",
	},
	GITHUB_CLIENT_ID: { schema: optional, description: "Client ID of the GitHub OAuth App used to sign in." },
	GITHUB_CLIENT_SECRET: { schema: optional, description: "Client secret of the GitHub OAuth App." },
	ADMIN_GITHUB_USERS: {
		schema: list,
		description: "Comma-separated GitHub usernames allowed into /admin. Empty means nobody.",
	},
	GOOGLE_CLIENT_ID: {
		schema: optional,
		description: "Client ID of the Google OAuth client used to sign in.",
	},
	GOOGLE_CLIENT_SECRET: { schema: optional, description: "Client secret of the Google OAuth client." },
	ADMIN_EMAILS: {
		schema: list,
		description:
			"Comma-separated e-mails allowed into /admin through any provider that verifies the address (Google).",
	},
	AUTH_TEST_LOGIN_TOKEN: {
		schema: optional,
		description:
			"Enables POST /api/test/login for automated tests when set. Never set it in production (it is refused there).",
	},

	// --- Content storage ----------------------------------------------------
	GITHUB_TOKEN: {
		schema: optional,
		description:
			"Fine-grained token with Contents read/write on GITHUB_REPO only. Without it, /admin writes to the local disk.",
	},
	GITHUB_REPO: { schema: optional, description: 'Repository that holds the content, as "owner/name".' },
	GITHUB_BRANCH: {
		schema: optional,
		description: 'Branch that receives content commits. Defaults to "main".',
	},
	CONTENT_ROOT: {
		schema: optional,
		description: "Project root used by the local disk content store. Defaults to the working directory.",
	},

	// --- E-mail ---------------------------------------------------------------
	RESEND_API_KEY: {
		schema: optional,
		description: "Resend API key. Without it, e-mails are logged to the console instead of sent.",
	},
	RESEND_FROM_EMAIL: {
		schema: optional,
		description: 'Sender, e.g. "My Blog <no-reply@example.com>". The domain must be verified in Resend.',
	},
	CONTACT_TO_EMAIL: {
		schema: optional,
		description: "Inbox that receives contact form messages. Defaults to site.contactEmail.",
	},
	CRON_SECRET: {
		schema: optional,
		description:
			"Bearer token accepted by the newsletter dispatch endpoint when called by a scheduler. At least 32 characters.",
	},

	// --- Post import -----------------------------------------------------------
	MISTRAL_API_KEY: {
		schema: optional,
		description:
			"Mistral API key. When set, /admin/import rewrites the source summary and FAQ with Mistral; without it, template texts are used.",
	},
});
