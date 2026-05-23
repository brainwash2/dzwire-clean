import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { upsertSubscription } from "@/lib/db";

export async function POST(request: NextRequest) {
  try {
    const signature = request.headers.get("x-signature");
    const webhookSecret = process.env.CHARGILY_WEBHOOK_SECRET;

    if (!webhookSecret) {
      console.error("Missing CHARGILY_WEBHOOK_SECRET in environment variables");
      return NextResponse.json({ error: "Server misconfiguration" }, { status: 500 });
    }

    if (!signature) {
      return NextResponse.json({ error: "Missing signature header" }, { status: 401 });
    }

    const rawBody = await request.text();

    // Verify cryptographic signature via SHA256 HMAC
    const computedSignature = crypto
      .createHmac("sha256", webhookSecret)
      .update(rawBody)
      .digest("hex");

    if (computedSignature !== signature) {
      console.warn("[SECURITY WARN] Invalid Chargily Webhook signature rejected.");
      return NextResponse.json({ error: "Cryptographic verification failed" }, { status: 403 });
    }

    const payload = JSON.parse(rawBody);
    console.log("[CHARGILY WEBHOOK] Signature verified. Processing event:", payload.type);

    if (payload.type === "checkout.paid") {
      const { user_id, plan_slug, expires_at } = payload.data;
      
      // Update PostgreSQL user subscription status
      await upsertSubscription(
        user_id,
        plan_slug,
        expires_at ? new Date(expires_at) : null
      );
      
      console.log(`[CHARGILY WEBHOOK] Successfully upgraded User ${user_id} to Plan ${plan_slug}`);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("[CHARGILY WEBHOOK ERROR]:", error);
    return NextResponse.json({ error: "Internal processing failure" }, { status: 500 });
  }
}
