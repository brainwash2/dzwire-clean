import { Pool, PoolConfig, QueryResultRow } from "pg";
import crypto from "crypto";

declare global {
  var __pgPool: Pool | undefined;
}

const poolConfig: PoolConfig = {
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === "production" 
    ? { rejectUnauthorized: true } 
    : { rejectUnauthorized: false }, 
  max: 8,
  idleTimeoutMillis: 10000,
  connectionTimeoutMillis: 5000,
};

export const pool: Pool = global.__pgPool ?? (global.__pgPool = new Pool(poolConfig));

if (process.env.NODE_ENV !== "production") {
  global.__pgPool = pool;
}

/**
 * Execute query statements directly against the connection pool
 */
export async function query<T extends QueryResultRow = any>(text: string, params?: any[]) {
  const start = Date.now();
  try {
    const res = await pool.query<T>(text, params);
    const duration = Date.now() - start;
    if (process.env.NODE_ENV !== "production") {
      console.log(`[DB Query] ${duration}ms | ${text.slice(0, 80)}...`);
    }
    return res;
  } catch (error) {
    console.error("[DB Query Error]:", error);
    throw error;
  }
}

/**
 * Empty stub to maintain backward compatibility
 */
export async function initDB(): Promise<void> {
  return;
}

// -----------------------------------------------------------------------------
// USER, SESSION, AND SUBSCRIPTION TRANS-QUERIES (Used by Auth Servers)
// -----------------------------------------------------------------------------

export interface DbUser {
  id: string;
  username: string | null;
  name: string | null;
  email: string | null;
  profile_image: string | null;
  created_at: Date;
}

export interface DbSubscription {
  id: number;
  user_id: string;
  plan_slug: string;
  status: string;
  expires_at: Date | null;
  created_at: Date;
  updated_at: Date;
}

export async function upsertUser(user: Omit<DbUser, "created_at">): Promise<void> {
  await query(
    `INSERT INTO users (id, username, name, email, profile_image)
     VALUES ($1, $2, $3, $4, $5)
     ON CONFLICT (id) DO UPDATE SET
       username = EXCLUDED.username,
       name = EXCLUDED.name,
       email = EXCLUDED.email,
       profile_image = EXCLUDED.profile_image`,
    [user.id, user.username, user.name, user.email, user.profile_image]
  );
}

export async function createSession(userId: string): Promise<string> {
  const id = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
  await query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [id, userId, expiresAt]
  );
  return id;
}

export async function getSessionUser(
  sessionId: string
): Promise<{ user: DbUser; subscription: DbSubscription | null } | null> {
  const { rows } = await query<DbUser & { session_expires: Date }>(
    `SELECT u.*, s.expires_at AS session_expires
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  );
  if (!rows[0]) return null;

  const user = rows[0];
  const subResult = await query<DbSubscription>(
    `SELECT * FROM user_subscriptions
     WHERE user_id = $1 AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC LIMIT 1`,
    [user.id]
  );
  return { user, subscription: subResult.rows[0] ?? null };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function upsertSubscription(
  userId: string,
  planSlug: string,
  expiresAt: Date | null
): Promise<void> {
  await query(
    `INSERT INTO user_subscriptions (user_id, plan_slug, status, expires_at)
     VALUES ($1, $2, 'active', $3)
     ON CONFLICT DO NOTHING`,
    [userId, planSlug, expiresAt]
  );
}
