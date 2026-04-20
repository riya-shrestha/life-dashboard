import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["active", "paused", "completed"];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

export async function GET() {
  try {
    const projects = await sql`
      SELECT * FROM projects
      WHERE status != 'archived'
      ORDER BY
        CASE status WHEN 'active' THEN 1 WHEN 'paused' THEN 2 WHEN 'completed' THEN 3 END,
        created_at DESC
      LIMIT 50
    `;
    return NextResponse.json({ projects });
  } catch {
    return NextResponse.json({ error: "Failed to fetch projects" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description = null, status = "active", progress = 0, color = "#A8B5A2", url = null } = body;

    if (!name?.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }
    if (name.length > 200) {
      return NextResponse.json({ error: "Name too long" }, { status: 400 });
    }
    if (!VALID_STATUSES.includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (typeof progress !== "number" || progress < 0 || progress > 100) {
      return NextResponse.json({ error: "Progress must be 0-100" }, { status: 400 });
    }
    if (!HEX_COLOR.test(color)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO projects (name, description, status, progress, color, url)
      VALUES (${name.trim()}, ${description}, ${status}, ${progress}, ${color}, ${url})
      RETURNING *
    `;
    return NextResponse.json({ project: result[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create project" }, { status: 500 });
  }
}
