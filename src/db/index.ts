import * as schema from './schema.js';
import dotenv from 'dotenv';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import fs from 'fs';
import path from 'path';

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
let db: any;
let pool: any = null;

const connectionString = process.env.DATABASE_URL || (
  (process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.PORT)
    ? "postgresql://postgres.pgmnnlufpfyrhgdzzuje:Dattatray%401511@aws-1-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbounce=true"
    : ""
);

if (connectionString || process.env.SQL_HOST) {
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

  pool = new Pool(connectionParams);
  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle SQL pool client:', err);
  });
  db = drizzlePg(pool, { schema });
} else {
  console.log('[DB] SQL_HOST/DATABASE_URL not set — using PGlite');
  const { PGlite } = await import('@electric-sql/pglite');
  const { drizzle: drizzlePglite } = await import('drizzle-orm/pglite');
  const client = new PGlite('./ifsc-local-data');
  db = drizzlePglite(client as any, { schema } as any);
}

export { db, pool };
export const createPool = () => pool;
