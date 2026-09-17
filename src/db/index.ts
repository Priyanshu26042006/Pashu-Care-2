import { drizzle, NodePgDatabase } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from './schema';

const { Pool } = pg;

let poolInstance: pg.Pool | null = null;
let dbInstance: NodePgDatabase<typeof schema> | null = null;

export function getPool(): pg.Pool | null {
  if (!poolInstance) {
    const connectionString = process.env.DATABASE_URL;
    if (!connectionString) {
      console.warn('[AI Studio] DATABASE_URL is not configured — running in offline mock mode.');
      return null;
    }
    try {
      poolInstance = new Pool({
        connectionString,
        ssl: {
          rejectUnauthorized: false, // Required for Neon Postgres over public SSL
        },
        max: 10,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000,
      });
      poolInstance.on('error', (err) => {
        console.warn('[AI Studio] PostgreSQL pool error (non-fatal):', err?.message);
      });
    } catch (err: any) {
      console.warn('[AI Studio] Failed to create pg.Pool, using in-memory mock:', err?.message);
      return null;
    }
  }
  return poolInstance;
}

export function getDb(): NodePgDatabase<typeof schema> {
  if (!dbInstance) {
    const pool = getPool();
    if (pool) {
      try {
        dbInstance = drizzle(pool, { schema });
      } catch (err: any) {
        console.warn('[AI Studio] Drizzle initialization warning, using mock:', err?.message);
      }
    }
    if (!dbInstance) {
      const chainable: any = () => chainable;
      chainable.from = () => chainable;
      chainable.where = () => chainable;
      chainable.orderBy = () => chainable;
      chainable.limit = () => chainable;
      chainable.values = () => chainable;
      chainable.returning = async () => [];
      chainable.onConflictDoUpdate = () => chainable;
      chainable.onConflictDoNothing = () => chainable;
      chainable.then = (resolve: any) => Promise.resolve([]).then(resolve);

      const noOp = {
        findMany: async () => [],
        findFirst: async () => null,
        findUnique: async () => null,
        create: async (d: any) => d?.data ?? {},
        update: async (d: any) => d?.data ?? {},
        delete: async () => ({}),
      };

      dbInstance = new Proxy({} as any, {
        get: (_, prop) => {
          if (prop === 'query') {
            return new Proxy({}, { get: () => noOp });
          }
          return () => chainable;
        },
      });
    }
  }
  return dbInstance!;
}

export function isDatabaseConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

// Proxy export for transparent backwards-compatible usage: `db.select...`
export const db = new Proxy({} as NodePgDatabase<typeof schema>, {
  get(_target, prop, receiver) {
    const realDb = getDb();
    const value = Reflect.get(realDb, prop, receiver);
    if (typeof value === 'function') {
      return value.bind(realDb);
    }
    return value;
  },
});

