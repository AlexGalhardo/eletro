import type { ReactElement } from "react";
import { Resend } from "resend";
import { RESEND_API_KEY, RESEND_FROM_EMAIL } from "#env";
import { site } from "../site.config.ts";

export type Email = {
	to: string;
	subject: string;
	react: ReactElement;
	replyTo?: string;
	headers?: Record<string, string>;
};

/** E-mails "sent" while no Resend key is configured. Lets development and tests inspect what would go out. */
export const outbox: Email[] = [];

const from = () => RESEND_FROM_EMAIL ?? `${site.name} <onboarding@resend.dev>`;

/** Sends through Resend, or records to the outbox when RESEND_API_KEY is not set. Throws on provider errors. */
export async function sendEmails(emails: Email[]): Promise<void> {
	if (emails.length === 0) return;

	if (!RESEND_API_KEY) {
		outbox.push(...emails);
		// The address stays out of the log: subscriber e-mails are personal data.
		for (const email of emails)
			console.info(`[mailer] RESEND_API_KEY not set; skipped "${email.subject}"`);
		return;
	}

	const resend = new Resend(RESEND_API_KEY);
	// Resend accepts at most 100 e-mails per batch request.
	for (let start = 0; start < emails.length; start += 100) {
		const batch = emails.slice(start, start + 100).map((email) => ({ from: from(), ...email }));
		const { error } = await resend.batch.send(batch);
		if (error) throw new Error(`Resend rejected the batch: ${error.message}`);
	}
}

export const sendEmail = (email: Email) => sendEmails([email]);
