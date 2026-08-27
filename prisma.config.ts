import "dotenv/config";
import { defineConfig, env } from "prisma/config";

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
