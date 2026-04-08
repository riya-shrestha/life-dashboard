import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_THEMES = ["light", "dark"];
const VALID_BG_TYPES = ["preset", "custom", "none"];

export async function GET() {
  try {
    const result = await sql`SELECT * FROM user_settings WHERE id = 1`;
    return NextResponse.json({ settings: result[0] || null });
  } catch {
    return NextResponse.json({ error: "Failed to fetch settings" }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  try {
    const body = await request.json();

    if (body.theme !== undefined && !VALID_THEMES.includes(body.theme)) {
      return NextResponse.json({ error: "Invalid theme" }, { status: 400 });
    }
    if (body.background_type !== undefined && !VALID_BG_TYPES.includes(body.background_type)) {
      return NextResponse.json({ error: "Invalid background type" }, { status: 400 });
    }
    if (body.background_image !== undefined && typeof body.background_image === "string" && body.background_image.length > 3_000_000) {
      return NextResponse.json({ error: "Background image too large" }, { status: 400 });
    }
    if (body.pomodoro_work_min !== undefined) {
      const v = body.pomodoro_work_min;
      if (typeof v !== "number" || v < 1 || v > 120) {
        return NextResponse.json({ error: "Work minutes must be 1-120" }, { status: 400 });
      }
    }
    if (body.pomodoro_break_min !== undefined) {
      const v = body.pomodoro_break_min;
      if (typeof v !== "number" || v < 1 || v > 60) {
        return NextResponse.json({ error: "Break minutes must be 1-60" }, { status: 400 });
      }
    }

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
  } catch {
    return NextResponse.json({ error: "Failed to update settings" }, { status: 500 });
  }
}
