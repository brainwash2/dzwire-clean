import { Webhook } from "svix";
import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { upsertUser } from "@/lib/db";

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    console.error("Missing CLERK_WEBHOOK_SECRET in environment");
    return new Response("Webhook secret unconfigured", { status: 500 });
  }

  // Capture verification headers
  const headerPayload = await headers();
  const svix_id = headerPayload.get("svix-id");
  const svix_timestamp = headerPayload.get("svix-timestamp");
  const svix_signature = headerPayload.get("svix-signature");

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  // Retrieve raw request body for verification
  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);
  let evt: any;

  try {
    evt = wh.verify(body, {
      "svix-id": svix_id,
      "svix-timestamp": svix_timestamp,
      "svix-signature": svix_signature,
    });
  } catch (err) {
    console.error("Clerk Webhook verification failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  console.log(`[Clerk Webhook] Received ${eventType} event for user ${id}`);

  if (eventType === "user.created" || eventType === "user.updated") {
    const { email_addresses, username, first_name, last_name, image_url } = evt.data;
    const email = email_addresses?.[0]?.email_address || null;
    const displayName = first_name || last_name 
      ? `${first_name || ""} ${last_name || ""}`.trim() 
      : null;

    try {
      // Sync Clerk authentication state to PostgreSQL users table
      await upsertUser({
        id,
        username: username || email?.split("@")[0] || id,
        name: displayName,
        email,
        profile_image: image_url || null,
      });
      console.log(`[Clerk Webhook] Successfully synced user ${id} to Database.`);
    } catch (dbError) {
      console.error(`[Clerk Webhook] Failed to sync user ${id} to Database:`, dbError);
      return new Response("Database write failed", { status: 500 });
    }
  }

  return NextResponse.json({ received: true });
}
