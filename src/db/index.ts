import * as schema from './schema.js';
import dotenv from 'dotenv';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';
import { createRequire } from 'module';

console.log("[DB] Top-level initialization started. VERCEL:", process.env.VERCEL, "NODE_ENV:", process.env.NODE_ENV);

function copyDirSync(src: string, dest: string) {
  fs.mkdirSync(dest, { recursive: true });
  const entries = fs.readdirSync(src, { withFileTypes: true });
  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

dotenv.config();

// Use PostgreSQL (production) when SQL_HOST or DATABASE_URL is set, otherwise PGlite (local dev)
let activeDb: any = null;
let pool: any = null;

const connectionString = process.env.DATABASE_URL || (
  (process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.PORT)
    ? "postgresql://postgres.pgmnnlufpfyrhgdzzuje:Dattatray%401511@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbounce=true"
    : ""
);

console.log("[DB] connectionString resolved. Length:", connectionString ? connectionString.length : 0);

function getDbInstance() {
  if (activeDb) return activeDb;

  console.log("[DB] getDbInstance initializing database connection...");
  if (connectionString || process.env.SQL_HOST) {
    console.log("[DB] Selecting PostgreSQL connection path");
    const connectionParams = connectionString
      ? {
          connectionString,
          ssl: { rejectUnauthorized: false },
          connectionTimeoutMillis: 5000,
          family: 4,
          max: 1,
        }
      : {
          host: process.env.SQL_HOST,
          user: process.env.SQL_USER,
          password: process.env.SQL_PASSWORD,
          database: process.env.SQL_DB_NAME,
          connectionTimeoutMillis: 5000,
          family: 4,
          max: 1,
        };

    try {
      pool = new Pool(connectionParams);
      pool.on('error', (err: Error) => {
        console.error('Unexpected error on idle SQL pool client:', err);
      });
      activeDb = drizzlePg(pool, { schema });
      console.log("[DB] PostgreSQL Pool and Drizzle instance created successfully");
    } catch (e: any) {
      console.error("[DB] Failed to create PostgreSQL instance:", e);
      throw e;
    }
  } else {
    console.log('[DB] SQL_HOST/DATABASE_URL not set — using PGlite path');
    try {
      const localRequire = createRequire(import.meta.url);
      const { PGlite } = localRequire('@electric-sql/pglite');
      const { drizzle: drizzlePglite } = localRequire('drizzle-orm/pglite');
      const client = new PGlite('./ifsc-local-data');
      activeDb = drizzlePglite(client as any, { schema } as any);
      console.log("[DB] PGlite client and Drizzle instance created successfully");
    } catch (e: any) {
      console.error("[DB] Failed to initialize PGlite:", e);
      throw e;
    }
  }
  return activeDb;
}

export const db = new Proxy({} as any, {
  get(target, prop) {
    console.log("[DB Proxy] Property accessed:", String(prop));
    const instance = getDbInstance();
    const value = Reflect.get(instance, prop);
    return typeof value === 'function' ? value.bind(instance) : value;
  }
});

export { pool };
export const createPool = () => pool;
