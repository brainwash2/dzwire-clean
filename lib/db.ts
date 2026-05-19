import { Pool } from "pg";

declare global {
  var __pgPool: Pool | undefined;
  var __dbInitialized: boolean | undefined;
}

export const pool: Pool =
  global.__pgPool ??
  (global.__pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
  }));

const CREATE_TABLES_SQL = `
  CREATE TABLE IF NOT EXISTS admin_settings (
    key   VARCHAR PRIMARY KEY,
    value TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS custom_events (
    id           VARCHAR PRIMARY KEY,
    date         VARCHAR NOT NULL,
    end_date     VARCHAR,
    title_fr     TEXT NOT NULL,
    title_ar     TEXT NOT NULL,
    title_en     TEXT NOT NULL,
    category     VARCHAR NOT NULL DEFAULT 'national',
    icon         VARCHAR NOT NULL DEFAULT '📅',
    description_fr TEXT,
    description_ar TEXT,
    description_en TEXT,
    location_fr  TEXT,
    location_ar  TEXT,
    location_en  TEXT,
    website      TEXT,
    tags         TEXT,
    is_approx    BOOLEAN NOT NULL DEFAULT FALSE,
    featured     BOOLEAN NOT NULL DEFAULT FALSE,
    created_at   TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS users (
    id          VARCHAR PRIMARY KEY,
    username    VARCHAR,
    name        VARCHAR,
    email       VARCHAR,
    profile_image VARCHAR,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS sessions (
    id          VARCHAR PRIMARY KEY,
    user_id     VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    expires_at  TIMESTAMPTZ NOT NULL,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS sessions_user_id_idx ON sessions(user_id);
  CREATE INDEX IF NOT EXISTS sessions_expires_at_idx ON sessions(expires_at);

  CREATE TABLE IF NOT EXISTS user_subscriptions (
    id          SERIAL PRIMARY KEY,
    user_id     VARCHAR NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_slug   VARCHAR NOT NULL,
    status      VARCHAR NOT NULL DEFAULT 'active',
    expires_at  TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT NOW(),
    updated_at  TIMESTAMPTZ DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS user_subscriptions_user_id_idx ON user_subscriptions(user_id);

  CREATE TABLE IF NOT EXISTS payment_logs (
    id          SERIAL PRIMARY KEY,
    charge_id   VARCHAR,
    user_id     VARCHAR,
    amount      INTEGER,
    currency    VARCHAR DEFAULT 'dzd',
    status      VARCHAR,
    plan_slug   VARCHAR,
    raw_data    JSONB,
    created_at  TIMESTAMPTZ DEFAULT NOW()
  );
`;

export async function initDB(): Promise<void> {
  if (global.__dbInitialized) return;
  global.__dbInitialized = true;
  try {
    await pool.query(CREATE_TABLES_SQL);
  } catch (err) {
    global.__dbInitialized = false;
    throw err;
  }
}

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
  await pool.query(
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
  await pool.query(
    `INSERT INTO sessions (id, user_id, expires_at) VALUES ($1, $2, $3)`,
    [id, userId, expiresAt]
  );
  return id;
}

export async function getSessionUser(
  sessionId: string
): Promise<{ user: DbUser; subscription: DbSubscription | null } | null> {
  const { rows } = await pool.query<DbUser & { session_expires: Date }>(
    `SELECT u.*, s.expires_at AS session_expires
     FROM sessions s
     JOIN users u ON s.user_id = u.id
     WHERE s.id = $1 AND s.expires_at > NOW()`,
    [sessionId]
  );
  if (!rows[0]) return null;

  const user = rows[0];
  const subResult = await pool.query<DbSubscription>(
    `SELECT * FROM user_subscriptions
     WHERE user_id = $1 AND status = 'active'
       AND (expires_at IS NULL OR expires_at > NOW())
     ORDER BY created_at DESC LIMIT 1`,
    [user.id]
  );
  return { user, subscription: subResult.rows[0] ?? null };
}

export async function deleteSession(sessionId: string): Promise<void> {
  await pool.query(`DELETE FROM sessions WHERE id = $1`, [sessionId]);
}

export async function upsertSubscription(
  userId: string,
  planSlug: string,
  expiresAt: Date | null
): Promise<void> {
  await pool.query(
    `INSERT INTO user_subscriptions (user_id, plan_slug, status, expires_at)
     VALUES ($1, $2, 'active', $3)
     ON CONFLICT DO NOTHING`,
    [userId, planSlug, expiresAt]
  );
}
