import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const events = await sql`
    SELECT * FROM calendar_events
    WHERE start_time >= NOW() - INTERVAL '1 day'
      AND start_time <= NOW() + INTERVAL '7 days'
      AND status = 'confirmed'
    ORDER BY start_time ASC
  `;

  const synced = await sql`
    SELECT MAX(synced_at) as last_synced FROM calendar_events
  `;

  return NextResponse.json({
    events,
    lastSynced: synced[0]?.last_synced || null,
  });
}
