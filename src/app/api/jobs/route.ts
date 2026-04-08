import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const [recent, stats] = await Promise.all([
    sql`SELECT * FROM job_applications ORDER BY date_applied DESC, created_at DESC LIMIT 10`,
    sql`SELECT status, COUNT(*)::int as count FROM job_applications GROUP BY status`,
  ]);

  return NextResponse.json({ recent, stats });
}
