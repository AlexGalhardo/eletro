import { randomBytes, randomUUID } from "node:crypto";
import { and, eq, inArray, ne, notInArray } from "drizzle-orm";
import { site } from "../site.config.ts";
import type { Database } from "./db/index.ts";
import { type NewsletterDispatch, newsletterDelivery, newsletterDispatch, subscriber } from "./db/schema.ts";
import { ConfirmEmail, NewPostEmail } from "./emails/NewsletterEmails.tsx";
import { type Email, sendEmails } from "./mailer.ts";

/** Resend accepts at most 100 e-mails per batch request. */
const BATCH = 100;
/** A pending address is not e-mailed again before this, so the form cannot be used to flood an inbox. */
const RESEND_CONFIRMATION_AFTER_MS = 10 * 60 * 1000;

const newToken = () => randomBytes(32).toString("base64url");

export const confirmUrl = (origin: string, token: string) =>
	`${origin}/newsletter/confirmar?token=${encodeURIComponent(token)}`;
export const unsubscribeUrl = (origin: string, token: string) =>
	`${origin}/newsletter/sair?token=${encodeURIComponent(token)}`;

/**
 * Registers the address as pending and e-mails the confirmation link.
 * It answers the same way whatever the state of the address, so the form does not reveal who is subscribed.
 */
export async function subscribe(
	db: Database,
	email: string,
	origin: string,
	now = new Date(),
): Promise<void> {
	const address = email.trim().toLowerCase();
	const [existing] = await db.select().from(subscriber).where(eq(subscriber.email, address));

	if (existing?.status === "confirmed") return;
	if (
		existing?.status === "pending" &&
		now.getTime() - existing.createdAt.getTime() < RESEND_CONFIRMATION_AFTER_MS
	)
		return;

	const token = newToken();
	if (existing) {
		await db
			.update(subscriber)
			.set({ status: "pending", token, createdAt: now, unsubscribedAt: null })
			.where(eq(subscriber.id, existing.id));
	} else {
		const inserted = await db
			.insert(subscriber)
			.values({ id: randomUUID(), email: address, token, createdAt: now })
			.onConflictDoNothing()
			.returning({ id: subscriber.id });
		// Two requests for the same new address at once: the other one sends the e-mail.
		if (inserted.length === 0) return;
	}

	await sendEmails([
		{
			to: address,
			subject: `Confirme sua inscrição - ${site.name}`,
			react: ConfirmEmail({ url: confirmUrl(origin, token) }),
		},
	]);
}

/** Confirms a pending subscription. Opening the link again is fine; an unknown token is not. */
export async function confirm(db: Database, token: string, now = new Date()): Promise<boolean> {
	if (!token) return false;
	await db
		.update(subscriber)
		.set({ status: "confirmed", confirmedAt: now })
		.where(and(eq(subscriber.token, token), eq(subscriber.status, "pending")));

	const [row] = await db
		.select({ status: subscriber.status })
		.from(subscriber)
		.where(eq(subscriber.token, token));
	return row?.status === "confirmed";
}

/** Stops every future e-mail to the owner of the token. Returns whether the token is known. */
export async function unsubscribe(db: Database, token: string, now = new Date()): Promise<boolean> {
	if (!token) return false;
	await db
		.update(subscriber)
		.set({ status: "unsubscribed", unsubscribedAt: now })
		.where(and(eq(subscriber.token, token), ne(subscriber.status, "unsubscribed")));

	const [row] = await db.select({ id: subscriber.id }).from(subscriber).where(eq(subscriber.token, token));
	return Boolean(row);
}

/**
 * Asks for a post to be announced. There is one dispatch per post: asking again changes nothing,
 * except that a dispatch that failed or stalled goes back to the queue.
 */
export async function requestDispatch(
	db: Database,
	slug: string,
	requestedBy: string,
): Promise<NewsletterDispatch> {
	await db.insert(newsletterDispatch).values({ id: randomUUID(), slug, requestedBy }).onConflictDoNothing();
	await db
		.update(newsletterDispatch)
		.set({ status: "pending", error: null })
		.where(
			and(eq(newsletterDispatch.slug, slug), inArray(newsletterDispatch.status, ["failed", "sending"])),
		);

	const [dispatch] = await db.select().from(newsletterDispatch).where(eq(newsletterDispatch.slug, slug));
	return dispatch as NewsletterDispatch;
}

type RunOptions = {
	origin: string;
	/** The post as published in the running deploy, or `undefined` while it is not live yet. */
	livePost: (slug: string) => { title: string; description: string } | undefined;
	send?: (emails: Email[]) => Promise<void>;
};

/**
 * Sends every queued announcement whose post is already live, one e-mail per confirmed subscriber.
 * Deliveries are recorded per batch, so a dispatch that fails midway resumes without e-mailing anyone twice.
 * ponytail: a crash between a batch being sent and being recorded repeats that batch (at most 100 e-mails) on retry.
 */
export async function runDispatches(db: Database, { origin, livePost, send = sendEmails }: RunOptions) {
	const queued = await db.select().from(newsletterDispatch).where(eq(newsletterDispatch.status, "pending"));
	const results: { slug: string; status: "sent" | "failed" | "waiting"; recipients: number }[] = [];

	for (const dispatch of queued) {
		const post = livePost(dispatch.slug);
		if (!post) {
			results.push({ slug: dispatch.slug, status: "waiting", recipients: 0 });
			continue;
		}

		// Claiming in one statement keeps two overlapping runs from sending the same dispatch.
		const claimed = await db
			.update(newsletterDispatch)
			.set({ status: "sending" })
			.where(and(eq(newsletterDispatch.id, dispatch.id), eq(newsletterDispatch.status, "pending")))
			.returning({ id: newsletterDispatch.id });
		if (claimed.length === 0) continue;

		const delivered = db
			.select({ id: newsletterDelivery.subscriberId })
			.from(newsletterDelivery)
			.where(eq(newsletterDelivery.dispatchId, dispatch.id));
		try {
			const recipients = await db
				.select({ id: subscriber.id, email: subscriber.email, token: subscriber.token })
				.from(subscriber)
				.where(and(eq(subscriber.status, "confirmed"), notInArray(subscriber.id, delivered)));

			for (let start = 0; start < recipients.length; start += BATCH) {
				const batch = recipients.slice(start, start + BATCH);
				await send(
					batch.map(({ email, token }) => {
						const leave = unsubscribeUrl(origin, token);
						return {
							to: email,
							subject: post.title,
							react: NewPostEmail({
								...post,
								url: `${origin}/${dispatch.slug}`,
								unsubscribeUrl: leave,
							}),
							headers: { "List-Unsubscribe": `<${leave}>` },
						};
					}),
				);
				await db
					.insert(newsletterDelivery)
					.values(batch.map(({ id }) => ({ dispatchId: dispatch.id, subscriberId: id })))
					.onConflictDoNothing();
			}

			const total = (await delivered).length;
			await db
				.update(newsletterDispatch)
				.set({ status: "sent", recipients: total, sentAt: new Date(), error: null })
				.where(eq(newsletterDispatch.id, dispatch.id));
			results.push({ slug: dispatch.slug, status: "sent", recipients: total });
		} catch (cause) {
			const total = (await delivered).length;
			await db
				.update(newsletterDispatch)
				.set({
					status: "failed",
					recipients: total,
					error: (cause instanceof Error ? cause.message : String(cause)).slice(0, 500),
				})
				.where(eq(newsletterDispatch.id, dispatch.id));
			results.push({ slug: dispatch.slug, status: "failed", recipients: total });
		}
	}

	return results;
}
