import { count, desc } from "drizzle-orm";
import { getDb } from "#lib/server/db/index.ts";
import { newsletterDispatch, subscriber } from "#lib/server/db/schema.ts";

export async function load() {
	const db = await getDb();
	const [totals, subscribers, dispatches] = await Promise.all([
		db.select({ status: subscriber.status, total: count() }).from(subscriber).groupBy(subscriber.status),
		// ponytail: the latest 200 only; add paging and search when the list outgrows one screen.
		db
			.select({ email: subscriber.email, status: subscriber.status, createdAt: subscriber.createdAt })
			.from(subscriber)
			.orderBy(desc(subscriber.createdAt))
			.limit(200),
		db.select().from(newsletterDispatch).orderBy(desc(newsletterDispatch.createdAt)).limit(100),
	]);

	return {
		totals: Object.fromEntries(totals.map((row) => [row.status, row.total])) as Record<string, number>,
		subscribers: subscribers.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
		dispatches: dispatches.map(({ slug, status, recipients, error, requestedBy, createdAt, sentAt }) => ({
			slug,
			status,
			recipients,
			error,
			requestedBy,
			createdAt: createdAt.toISOString(),
			sentAt: sentAt?.toISOString() ?? null,
		})),
	};
}
