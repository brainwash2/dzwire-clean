import crypto from "crypto";

const CHARGILY_BASE = "https://pay.chargily.net/api/v2";

export interface ChargilyCheckoutParams {
  amount: number;
  currency?: string;
  description: string;
  successUrl: string;
  failureUrl: string;
  webhookEndpoint?: string;
  metadata?: Record<string, string>;
}

export interface ChargilyCheckoutResult {
  id: string;
  checkout_url: string;
  status: string;
}

export async function createChargilyCheckout(
  params: ChargilyCheckoutParams
): Promise<ChargilyCheckoutResult> {
  const secretKey = process.env.CHARGILY_SECRET_KEY;
  if (!secretKey) {
    throw new Error("CHARGILY_SECRET_KEY is not configured");
  }

  const body = {
    amount: params.amount,
    currency: params.currency ?? "dzd",
    payment_method: "edahabia",
    success_url: params.successUrl,
    failure_url: params.failureUrl,
    webhook_endpoint: params.webhookEndpoint,
    description: params.description,
    metadata: params.metadata ?? {},
  };

  const res = await fetch(`${CHARGILY_BASE}/checkouts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${secretKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Chargily API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<ChargilyCheckoutResult>;
}

export function verifyChargilySignature(
  rawBody: string,
  signature: string
): boolean {
  const webhookSecret = process.env.CHARGILY_WEBHOOK_SECRET;
  if (!webhookSecret) return false;

  try {
    const computed = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    return crypto.timingSafeEqual(
      Buffer.from(computed, "hex"),
      Buffer.from(signature, "hex")
    );
  } catch {
    return false;
  }
}

export const PLANS: Record<
  string,
  { nameFr: string; nameAr: string; amount: number; durationDays: number | null }
> = {
  mensuel: {
    nameFr: "Premium Mensuel",
    nameAr: "مميز شهري",
    amount: 490_00,
    durationDays: 30,
  },
  annuel: {
    nameFr: "Premium Annuel",
    nameAr: "مميز سنوي",
    amount: 3_900_00,
    durationDays: 365,
  },
};
