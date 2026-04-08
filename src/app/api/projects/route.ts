import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const projects = await sql`
    SELECT * FROM projects
    WHERE status != 'archived'
    ORDER BY
      CASE status WHEN 'active' THEN 1 WHEN 'paused' THEN 2 WHEN 'completed' THEN 3 END,
      created_at DESC
  `;
  return NextResponse.json({ projects });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { name, description = null, status = "active", progress = 0, color = "#A8B5A2", url = null } = body;

  if (!name?.trim()) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO projects (name, description, status, progress, color, url)
    VALUES (${name.trim()}, ${description}, ${status}, ${progress}, ${color}, ${url})
    RETURNING *
  `;
  return NextResponse.json({ project: result[0] }, { status: 201 });
}
