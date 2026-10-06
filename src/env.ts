import { defineEnvVars } from "@sveltejs/kit/env";

// Every variable is optional so a fresh clone runs with no configuration: the public site needs none,
// and each feature explains what is missing when it is used without its variables.
const optional = (value: string | undefined) => value?.trim() || undefined;

export const variables = defineEnvVars({
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
});
