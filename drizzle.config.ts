import { defineConfig } from "drizzle-kit";

// `bun run db:generate` writes SQL migrations to ./drizzle from the schema.
// `bun run db:migrate` applies them to DATABASE_URL (Neon). PGlite applies them by itself on startup.
export default defineConfig({
	dialect: "postgresql",
	schema: "./src/lib/server/db/schema.ts",
	out: "./drizzle",
	dbCredentials: { url: process.env.DATABASE_URL ?? "" },
});
