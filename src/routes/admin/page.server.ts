import { count, eq } from "drizzle-orm";
import { listPosts, listProductLists } from "#lib/server/cms.ts";
import { getBundledPostSources } from "#lib/server/content.ts";
import { getDb } from "#lib/server/db/index.ts";
import { subscriber } from "#lib/server/db/schema.ts";
import { isPostDeployed } from "#lib/server/deploy.ts";
import { getStore } from "#lib/server/store/index.ts";

export async function load() {
	const store = getStore();
	const db = await getDb();

	const [posts, lists, subscribers, commits] = await Promise.all([
		listPosts(store, getBundledPostSources()),
		listProductLists(store),
		db.select({ total: count() }).from(subscriber).where(eq(subscriber.status, "confirmed")),
		// The dashboard still opens when the commit history cannot be read.
		store.history("content", 8).catch(() => []),
	]);

	const total = (status: string) => posts.filter((post) => post.status === status).length;
	return {
		kind: store.kind,
		totals: {
			published: total("published"),
			drafts: total("draft"),
			scheduled: total("scheduled"),
			invalid: total("invalid"),
			lists: lists.length,
			subscribers: subscribers[0]?.total ?? 0,
			// ponytail: posts deleted but still deployed are not counted; add them if that ever confuses someone.
			pending: posts.filter((post) => !isPostDeployed(post.slug, post.sha)).length,
		},
		commits,
	};
}
