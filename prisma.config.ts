import { config } from "dotenv";
import { defineConfig, env } from "prisma/config";

// Next.js loads .env.local before .env (and gives it precedence), so that's
// what the running app's runtime DB client actually reads. dotenv's default
// `dotenv/config` only loads .env, so a plain `prisma migrate` here would
// silently target local Postgres while the app talks to Neon. Load in the
// same order/precedence Next.js uses so migrations land on the same database
// the app is actually running against.
config({ path: ".env.local" });
config({ path: ".env" });

export default defineConfig({
  schema: "prisma/schema.prisma",
  datasource: {
    // Migrations need a session-scoped connection for advisory locking;
    // Neon's pooled DATABASE_URL runs through PgBouncer transaction mode,
    // which doesn't support that. The app's runtime client (src/lib/db.ts)
    // builds its own adapter from DATABASE_URL directly and is unaffected.
    url: process.env.DATABASE_URL_UNPOOLED || env("DATABASE_URL"),
  },
});
