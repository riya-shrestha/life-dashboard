import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_PRIORITIES = ["low", "medium", "high"];

export async function GET() {
  try {
    const todos = await sql`
      SELECT * FROM todos
      ORDER BY completed ASC,
        CASE priority WHEN 'high' THEN 1 WHEN 'medium' THEN 2 WHEN 'low' THEN 3 END,
        created_at DESC
      LIMIT 100
    `;
    return NextResponse.json({ todos });
  } catch {
    return NextResponse.json({ error: "Failed to fetch todos" }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, priority = "medium", category = null, due_date = null } = body;

    if (!title?.trim()) {
      return NextResponse.json({ error: "Title is required" }, { status: 400 });
    }
    if (title.length > 500) {
      return NextResponse.json({ error: "Title too long" }, { status: 400 });
    }
    if (!VALID_PRIORITIES.includes(priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    const result = await sql`
      INSERT INTO todos (title, priority, category, due_date)
      VALUES (${title.trim()}, ${priority}, ${category}, ${due_date})
      RETURNING *
    `;
    return NextResponse.json({ todo: result[0] }, { status: 201 });
  } catch {
    return NextResponse.json({ error: "Failed to create todo" }, { status: 500 });
  }
}
