import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const result = await sql`SELECT * FROM user_settings WHERE id = 1`;
  return NextResponse.json({ settings: result[0] || null });
}

export async function PATCH(request: Request) {
  const body = await request.json();

  const result = await sql`
    UPDATE user_settings SET
      theme = COALESCE(${body.theme ?? null}, theme),
      background_image = COALESCE(${body.background_image ?? null}, background_image),
      background_type = COALESCE(${body.background_type ?? null}, background_type),
      pomodoro_work_min = COALESCE(${body.pomodoro_work_min ?? null}, pomodoro_work_min),
      pomodoro_break_min = COALESCE(${body.pomodoro_break_min ?? null}, pomodoro_break_min),
      pomodoro_long_break = COALESCE(${body.pomodoro_long_break ?? null}, pomodoro_long_break),
      greeting_name = COALESCE(${body.greeting_name ?? null}, greeting_name),
      updated_at = now()
    WHERE id = 1
    RETURNING *
  `;

  return NextResponse.json({ settings: result[0] });
}
