import * as client from "openid-client";
import { cookies } from "next/headers";
import {
  initDB,
  upsertUser,
  createSession,
  getSessionUser,
  type DbUser,
  type DbSubscription,
} from "./db";

const REPLIT_OIDC_ISSUER = "https://replit.com/oidc";
const SESSION_COOKIE = "dzwire_session";
const PKCE_CV_COOKIE = "dzwire_pkce_cv";
const PKCE_STATE_COOKIE = "dzwire_pkce_state";
const PKCE_NONCE_COOKIE = "dzwire_pkce_nonce";
const RETURN_TO_COOKIE = "dzwire_return_to";
const TEMP_COOKIE_TTL = 60 * 10;

export async function getOIDCConfig(): Promise<client.Configuration> {
  const clientId = process.env.REPL_ID;
  if (!clientId) throw new Error("REPL_ID environment variable not set");
  return client.discovery(new URL(REPLIT_OIDC_ISSUER), clientId);
}

export interface AuthSession {
  user: DbUser;
  subscription: DbSubscription | null;
}

export async function getServerSession(): Promise<AuthSession | null> {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    if (!sessionId) return null;
    await initDB();
    return await getSessionUser(sessionId);
  } catch {
    return null;
  }
}

export interface LoginParams {
  redirectUri: string;
  returnTo: string;
}

export async function buildLoginUrl(params: LoginParams): Promise<{
  url: URL;
  codeVerifier: string;
  state: string;
  nonce: string;
}> {
  const config = await getOIDCConfig();
  const codeVerifier = client.randomPKCECodeVerifier();
  const codeChallenge = await client.calculatePKCECodeChallenge(codeVerifier);
  const state = client.randomState();
  const nonce = client.randomNonce();

  const url = client.buildAuthorizationUrl(config, {
    redirect_uri: params.redirectUri,
    scope: "openid profile email",
    state,
    nonce,
    code_challenge: codeChallenge,
    code_challenge_method: "S256",
  });

  return { url, codeVerifier, state, nonce };
}

export async function exchangeCode(params: {
  currentUrl: URL;
  redirectUri: string;
  codeVerifier: string;
  expectedState: string;
  expectedNonce: string;
}): Promise<string> {
  const config = await getOIDCConfig();

  const tokens = await client.authorizationCodeGrant(config, params.currentUrl, {
    pkceCodeVerifier: params.codeVerifier,
    expectedState: params.expectedState,
    expectedNonce: params.expectedNonce,
  });

  const claims = tokens.claims();
  if (!claims?.sub) throw new Error("No subject in token claims");

  await initDB();

  const userId = claims.sub;
  const username =
    (claims["preferred_username"] as string | undefined) ??
    (claims.name as string | undefined) ??
    userId;
  const name = (claims.name as string | undefined) ?? null;
  const email = (claims.email as string | undefined) ?? null;
  const profileImage =
    (claims["profile_image"] as string | undefined) ??
    (claims.picture as string | undefined) ??
    null;

  await upsertUser({ id: userId, username, name, email, profile_image: profileImage });
  const sessionId = await createSession(userId);
  return sessionId;
}

export {
  SESSION_COOKIE,
  PKCE_CV_COOKIE,
  PKCE_STATE_COOKIE,
  PKCE_NONCE_COOKIE,
  RETURN_TO_COOKIE,
  TEMP_COOKIE_TTL,
};
