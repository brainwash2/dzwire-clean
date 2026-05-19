import { checkAdminCookie, isAdminSetup } from "@/lib/admin-auth";
import { pool, initDB } from "@/lib/db";
import type { DbEvent } from "@/lib/db-events";
import AdminEventsClient from "@/components/AdminEventsClient";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function AdminEventsPage() {
  await initDB();
  const authed = await checkAdminCookie();
  const setup = await isAdminSetup();

  let events: DbEvent[] = [];
  if (authed) {
    const { rows } = await pool.query<DbEvent>(
      "SELECT * FROM custom_events ORDER BY date ASC, created_at DESC"
    );
    events = rows;
  }

  return (
    <AdminEventsClient
      initialAuthed={authed}
      initialSetup={setup}
      initialEvents={events}
    />
  );
}
