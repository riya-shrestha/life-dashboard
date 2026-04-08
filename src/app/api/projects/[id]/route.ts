import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  const result = await sql`
    UPDATE projects SET
      name = COALESCE(${body.name ?? null}, name),
      description = ${body.description !== undefined ? body.description : null},
      status = COALESCE(${body.status ?? null}, status),
      progress = COALESCE(${body.progress ?? null}, progress),
      color = COALESCE(${body.color ?? null}, color),
      url = ${body.url !== undefined ? body.url : null},
      updated_at = now()
    WHERE id = ${Number(id)}
    RETURNING *
  `;

  if (result.length === 0) {
    return NextResponse.json({ error: "Project not found" }, { status: 404 });
  }

  return NextResponse.json({ project: result[0] });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await sql`UPDATE projects SET status = 'archived', updated_at = now() WHERE id = ${Number(id)}`;
  return NextResponse.json({ success: true });
}
