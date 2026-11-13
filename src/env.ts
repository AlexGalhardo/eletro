// Private environment, read at import time. Server code imports this module as `#env`.
// Every variable stays optional: a fresh clone runs the public site with nothing set.

const optional = (value: string | undefined) => value?.trim() || undefined;

const list = (value: string | undefined) =>
	(value ?? "")
		.split(",")
		.map((item) => item.trim().toLowerCase())
		.filter(Boolean);

export const DATABASE_URL = optional(process.env.DATABASE_URL);
export const PGLITE_DIR = optional(process.env.PGLITE_DIR);
export const BETTER_AUTH_SECRET = optional(process.env.BETTER_AUTH_SECRET);
export const BETTER_AUTH_URL = optional(process.env.BETTER_AUTH_URL);
export const GITHUB_CLIENT_ID = optional(process.env.GITHUB_CLIENT_ID);
export const GITHUB_CLIENT_SECRET = optional(process.env.GITHUB_CLIENT_SECRET);
export const ADMIN_GITHUB_USERS = list(process.env.ADMIN_GITHUB_USERS);
export const GOOGLE_CLIENT_ID = optional(process.env.GOOGLE_CLIENT_ID);
export const GOOGLE_CLIENT_SECRET = optional(process.env.GOOGLE_CLIENT_SECRET);
export const ADMIN_EMAILS = list(process.env.ADMIN_EMAILS);
export const AUTH_TEST_LOGIN_TOKEN = optional(process.env.AUTH_TEST_LOGIN_TOKEN);
export const GITHUB_TOKEN = optional(process.env.GITHUB_TOKEN);
export const GITHUB_REPO = optional(process.env.GITHUB_REPO);
export const GITHUB_BRANCH = optional(process.env.GITHUB_BRANCH);
export const CONTENT_ROOT = optional(process.env.CONTENT_ROOT);
export const RESEND_API_KEY = optional(process.env.RESEND_API_KEY);
export const RESEND_FROM_EMAIL = optional(process.env.RESEND_FROM_EMAIL);
export const CONTACT_TO_EMAIL = optional(process.env.CONTACT_TO_EMAIL);
export const CRON_SECRET = optional(process.env.CRON_SECRET);
export const MISTRAL_API_KEY = optional(process.env.MISTRAL_API_KEY);
export const GOOGLE_SERVICE_ACCOUNT_EMAIL = optional(process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL);
export const GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY = optional(process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY);
export const GOOGLE_SEARCH_CONSOLE_SITE = optional(process.env.GOOGLE_SEARCH_CONSOLE_SITE);
export const GOOGLE_ANALYTICS_PROPERTY_ID = optional(process.env.GOOGLE_ANALYTICS_PROPERTY_ID);
