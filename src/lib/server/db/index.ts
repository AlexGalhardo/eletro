import type { PgDatabase, PgQueryResultHKT } from "drizzle-orm/pg-core";
import { DATABASE_URL, PGLITE_DIR } from "#env";
import * as schema from "./schema.ts";

export type Database = PgDatabase<PgQueryResultHKT, typeof schema>;

let database: Promise<Database> | undefined;

/**
 * Neon in production; an embedded PGlite database otherwise, so development and tests need no setup.
 * Drivers are imported lazily to keep the one that is not used out of the server bundle's hot path.
 */
export function getDb(): Promise<Database> {
	database ??= connect();
	return database;
}

async function connect(): Promise<Database> {
	if (DATABASE_URL) {
		const { neon } = await import("@neondatabase/serverless");
		const { drizzle } = await import("drizzle-orm/neon-http");
		// Migrations for Neon are applied explicitly with `bun run db:migrate`.
		return drizzle(neon(DATABASE_URL), { schema });
	}

	const { PGlite } = await import("@electric-sql/pglite");
	const { drizzle } = await import("drizzle-orm/pglite");
	const { migrate } = await import("drizzle-orm/pglite/migrator");

	const dir = PGLITE_DIR ?? ".data/pglite";
	// PGlite creates only the last folder of the path, so a fresh clone (no `.data/`) would fail to start.
	if (!dir.includes("://")) {
		const { mkdir } = await import("node:fs/promises");
		await mkdir(dir, { recursive: true });
	}

	const db = drizzle(new PGlite(dir), { schema });
	await migrate(db, { migrationsFolder: "drizzle" });
	return db;
}
