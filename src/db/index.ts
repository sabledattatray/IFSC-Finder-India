import * as schema from './schema.js';
import dotenv from 'dotenv';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';

dotenv.config();

// Use PostgreSQL (production) when SQL_HOST or DATABASE_URL is set, otherwise PGlite (local dev)
let db: any;
let pool: any = null;

if (process.env.DATABASE_URL || process.env.SQL_HOST) {
  if (process.env.DATABASE_URL) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 15000,
    });
  } else {
    pool = new Pool({
      host: process.env.SQL_HOST,
      user: process.env.SQL_USER,
      password: process.env.SQL_PASSWORD,
      database: process.env.SQL_DB_NAME,
      connectionTimeoutMillis: 15000,
    });
  }
  pool.on('error', (err: Error) => {
    console.error('Unexpected error on idle SQL pool client:', err);
  });
  db = drizzlePg(pool, { schema });
} else {
  console.log('[DB] SQL_HOST/DATABASE_URL not set — using PGlite (local embedded Postgres)');
  const client = new PGlite('./ifsc-local-data');
  db = drizzlePglite(client as any, { schema } as any);
}

export { db, pool };
export const createPool = () => pool;
