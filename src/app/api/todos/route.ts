import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function GET() {
  const todos = await sql`
    SELECT * FROM todos
    ORDER BY completed ASC,
      CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
      created_at DESC
  `;
  return NextResponse.json({ todos });
}

export async function POST(request: Request) {
  const body = await request.json();
  const { title, priority = "medium", category = null, due_date = null } = body;

  if (!title?.trim()) {
    return NextResponse.json({ error: "Title is required" }, { status: 400 });
  }

  const result = await sql`
    INSERT INTO todos (title, priority, category, due_date)
    VALUES (${title.trim()}, ${priority}, ${category}, ${due_date})
    RETURNING *
  `;
  return NextResponse.json({ todo: result[0] }, { status: 201 });
}
