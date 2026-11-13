import { CONTACT_TO_EMAIL } from "#env";
import { contactSchema } from "#lib/contact.ts";
import { ContactEmail } from "#lib/server/emails/ContactEmail.tsx";
import { json } from "#lib/server/http.ts";
import { sendEmail } from "#lib/server/mailer.ts";
import { site } from "#lib/site.config.ts";

export async function POST({ request }) {
	const parsed = contactSchema.safeParse(await request.json().catch(() => null));
	if (!parsed.success) {
		return json(
			{ error: { code: "invalid_request", message: "Invalid contact message" } },
			{ status: 400 },
		);
	}

	try {
		await sendEmail({
			to: CONTACT_TO_EMAIL ?? site.contactEmail,
			replyTo: parsed.data.email,
			subject: `${site.domain} Contato`,
			react: ContactEmail(parsed.data),
		});
	} catch (cause) {
		console.error("[contact] failed to send message", cause);
		return json(
			{ error: { code: "email_failed", message: "Could not send the message" } },
			{ status: 502 },
		);
	}

	return json({ success: true });
}
