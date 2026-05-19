import { NextRequest, NextResponse } from "next/server";
import { createChargilyCheckout, PLANS } from "@/lib/chargily";
import { SESSION_COOKIE } from "@/lib/auth-server";
import { initDB, getSessionUser } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const sessionId = req.cookies.get(SESSION_COOKIE)?.value;
    if (!sessionId) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    await initDB();
    const session = await getSessionUser(sessionId);
    if (!session) {
      return NextResponse.json({ error: "Invalid session" }, { status: 401 });
    }

    const body = await req.json();
    const { planSlug, locale = "fr" } = body as { planSlug: string; locale?: string };

    const plan = PLANS[planSlug];
    if (!plan) {
      return NextResponse.json({ error: "Invalid plan" }, { status: 400 });
    }

    const host = req.headers.get("host") ?? req.nextUrl.host;
    const proto = req.headers.get("x-forwarded-proto") ?? "https";
    const baseUrl = `${proto}://${host}`;

    const checkout = await createChargilyCheckout({
      amount: plan.amount,
      currency: "dzd",
      description: locale === "ar" ? plan.nameAr : plan.nameFr,
      successUrl: `${baseUrl}/${locale}/payment/success?plan=${planSlug}`,
      failureUrl: `${baseUrl}/${locale}/payment/failure`,
      webhookEndpoint: `${baseUrl}/api/chargily/webhook`,
      metadata: {
        userId: session.user.id,
        planSlug,
        locale,
      },
    });

    return NextResponse.json({ checkoutUrl: checkout.checkout_url });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Checkout failed";
    const isConfig = message.includes("not configured");
    return NextResponse.json(
      { error: isConfig ? "Payment not yet configured" : message },
      { status: isConfig ? 503 : 500 }
    );
  }
}
