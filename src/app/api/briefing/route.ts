import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const result = await sql`
      SELECT * FROM briefing_summaries
      ORDER BY briefing_date DESC
      LIMIT 1
    `;

    return NextResponse.json({ briefing: result[0] || null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch briefing" }, { status: 500 });
  }
}
