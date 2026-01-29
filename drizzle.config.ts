import "dotenv/config";
import { defineConfig } from "drizzle-kit";
import { errors } from "@/lib/errors";

if (!process.env.DATABASE_URL) {
  throw errors.ENV_VAR_NOT_FOUND;
}

export default defineConfig({
  out: "./drizzle",
  schema: "./src/db/schema.ts",
  dialect: "postgresql",
  dbCredentials: {
    url: process.env.DATABASE_URL,
  },
});
