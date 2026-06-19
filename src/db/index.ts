import * as schema from './schema.js';
import dotenv from 'dotenv';
import { drizzle as drizzlePg } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { PGlite } from '@electric-sql/pglite';
import { drizzle as drizzlePglite } from 'drizzle-orm/pglite';

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
  console.log('[DB] SQL_HOST/DATABASE_URL not set — using PGlite');
  let dbPath = './ifsc-local-data';
  
  if (process.env.NODE_ENV === 'production' || process.env.VERCEL || process.env.PORT) {
    const tmpPath = '/tmp/ifsc-local-data';
    if (!fs.existsSync(tmpPath)) {
      try {
        console.log('[DB] Serverless production detected. Copying pre-built PGlite database to /tmp...');
        if (fs.existsSync(dbPath)) {
          copyDirSync(dbPath, tmpPath);
          console.log('[DB] PGlite copy to /tmp complete.');
        } else {
          console.warn('[DB] Source PGlite directory not found at:', dbPath);
        }
      } catch (err: any) {
        console.error('[DB] Failed to copy PGlite database to /tmp:', err.message);
      }
    }
    if (fs.existsSync(tmpPath)) {
      dbPath = tmpPath;
    }
  }
  
  const client = new PGlite(dbPath);
  db = drizzlePglite(client as any, { schema } as any);
}

export { db, pool };
export const createPool = () => pool;
