import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const setClauses: string[] = [];
  const values: unknown[] = [];

  if (body.title !== undefined) {
    setClauses.push("title");
    values.push(body.title);
  }
  if (body.completed !== undefined) {
    setClauses.push("completed");
    values.push(body.completed);
  }
  if (body.priority !== undefined) {
    setClauses.push("priority");
    values.push(body.priority);
  }
  if (body.category !== undefined) {
    setClauses.push("category");
    values.push(body.category);
  }
  if (body.due_date !== undefined) {
    setClauses.push("due_date");
    values.push(body.due_date);
  }

  if (setClauses.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  // Build a simple update — neon tagged templates don't support dynamic column names,
  // so we use individual updates for each possible field
  const result = await sql`
    UPDATE todos SET
      title = COALESCE(${body.title ?? null}, title),
      completed = COALESCE(${body.completed ?? null}, completed),
      priority = COALESCE(${body.priority ?? null}, priority),
      category = ${body.category !== undefined ? body.category : null},
      due_date = ${body.due_date !== undefined ? body.due_date : null},
      updated_at = now()
    WHERE id = ${Number(id)}
    RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Todo not found" }, { status: 404 });
  }

  return NextResponse.json({ todo: result[0] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`DELETE FROM todos WHERE id = ${Number(id)}`;
  return NextResponse.json({ success: true });
}
