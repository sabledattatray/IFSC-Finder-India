import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_URL;
const sqlHost = process.env.SQL_HOST;
const sqlDbName = process.env.SQL_DB_NAME;
const user = process.env.SQL_ADMIN_USER;
const password = process.env.SQL_ADMIN_PASSWORD;

if (!dbUrl && (!sqlHost || !sqlDbName || !user || !password)) {
  throw new Error("Database environment variables are missing.");
}

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  schemaFilter: ["public"],
  dbCredentials: dbUrl ? { url: dbUrl } : {
    host: sqlHost,
    user: user,
    password: password,
    database: sqlDbName,
    ssl: false,
  },
  verbose: true,
});
