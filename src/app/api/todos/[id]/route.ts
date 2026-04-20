import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_PRIORITIES = ["low", "medium", "high"];

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId < 1) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const body = await request.json();

    if (body.title !== undefined && (!body.title?.trim() || body.title.length > 500)) {
      return NextResponse.json({ error: "Invalid title" }, { status: 400 });
    }
    if (body.priority !== undefined && !VALID_PRIORITIES.includes(body.priority)) {
      return NextResponse.json({ error: "Invalid priority" }, { status: 400 });
    }

    const result = await sql`
      UPDATE todos SET
        title = COALESCE(${body.title ?? null}, title),
        completed = COALESCE(${body.completed ?? null}, completed),
        priority = COALESCE(${body.priority ?? null}, priority),
        category = ${body.category !== undefined ? body.category : null},
        due_date = ${body.due_date !== undefined ? body.due_date : null},
        updated_at = now()
      WHERE id = ${numId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Todo not found" }, { status: 404 });
    }

    return NextResponse.json({ todo: result[0] });
  } catch {
    return NextResponse.json({ error: "Failed to update todo" }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const numId = Number(id);
    if (!Number.isInteger(numId) || numId < 1) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }
    await sql`DELETE FROM todos WHERE id = ${numId}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to delete todo" }, { status: 500 });
  }
}
