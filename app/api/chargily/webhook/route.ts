import { NextRequest, NextResponse } from "next/server";
import { verifyChargilySignature, PLANS } from "@/lib/chargily";
import { initDB, upsertSubscription, pool } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.text();
    const signature = req.headers.get("signature") ?? "";

    if (!verifyChargilySignature(rawBody, signature)) {
      return NextResponse.json({ error: "Invalid signature" }, { status: 401 });
    }

    const event = JSON.parse(rawBody) as {
      type: string;
      data: {
        id: string;
        status: string;
        amount: number;
        metadata?: Record<string, string>;
      };
    };

    await initDB();

    const { type, data } = event;
    const metadata = data.metadata ?? {};
    const userId = metadata.userId;
    const planSlug = metadata.planSlug;

    await pool.query(
      `INSERT INTO payment_logs (charge_id, user_id, amount, status, plan_slug, raw_data)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [data.id, userId ?? null, data.amount, data.status, planSlug ?? null, JSON.stringify(event)]
    );

    if (type === "checkout.paid" && userId && planSlug) {
      const plan = PLANS[planSlug];
      let expiresAt: Date | null = null;
      if (plan?.durationDays) {
        expiresAt = new Date(Date.now() + plan.durationDays * 24 * 60 * 60 * 1000);
      }
      await upsertSubscription(userId, planSlug, expiresAt);
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("[chargily/webhook]", err);
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 });
  }
}
