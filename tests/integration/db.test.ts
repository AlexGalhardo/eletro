import { rm } from "node:fs/promises";
import type { PGlite } from "@electric-sql/pglite";
import { sql } from "drizzle-orm";
import { afterAll, beforeAll, describe, expect, it, vi } from "vitest";
import { getDb } from "../../src/lib/server/db/index.ts";
import { newsletterDispatch, subscriber } from "../../src/lib/server/db/schema.ts";

// A folder whose parent does not exist yet, as `.data/pglite` on a fresh clone.
const { root, dir } = await vi.hoisted(async () => {
	const { mkdtemp } = await import("node:fs/promises");
	const { tmpdir } = await import("node:os");
	const path = await import("node:path");
	const root = await mkdtemp(path.join(tmpdir(), "db-"));
	return { root, dir: path.join(root, "nested", "pglite") };
});

vi.mock("$app/env/private", async () => {
	const { testEnv } = await import("./env.ts");
	return testEnv({ PGLITE_DIR: dir });
});

let db: Awaited<ReturnType<typeof getDb>>;

beforeAll(async () => {
	db = await getDb();
});
afterAll(async () => {
	await (db as unknown as { $client: PGlite }).$client.close();
	await rm(root, { recursive: true, force: true });
});

describe("local database", () => {
	it("creates the folder and applies every migration to a clean PGlite", async () => {
		// The driver-agnostic `Database` type does not know the result shape of a raw query.
		const result = (await db.execute(
			sql`select table_name from information_schema.tables where table_schema = 'public' order by 1`,
		)) as { rows: { table_name: string }[] };

		expect(result.rows.map((row) => row.table_name)).toEqual([
			"account",
			"newsletter_dispatch",
			"session",
			"subscriber",
			"user",
			"verification",
		]);
	});

	it("returns the same connection on every call", async () => {
		expect(await getDb()).toBe(db);
	});

	it("applies defaults and refuses a repeated subscriber e-mail", async () => {
		const [row] = await db
			.insert(subscriber)
			.values({ id: "s1", email: "a@example.com", token: "t1" })
			.returning();

		expect(row).toMatchObject({ status: "pending", confirmedAt: null });
		expect(row?.createdAt).toBeInstanceOf(Date);
		await expect(
			db.insert(subscriber).values({ id: "s2", email: "a@example.com", token: "t2" }),
		).rejects.toThrow();
	});

	it("refuses a second dispatch for the same post", async () => {
		await db.insert(newsletterDispatch).values({ id: "d1", slug: "post" });

		await expect(db.insert(newsletterDispatch).values({ id: "d2", slug: "post" })).rejects.toThrow();
	});
});
