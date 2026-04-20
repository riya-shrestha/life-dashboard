import { sql } from "@/lib/db";
import { NextResponse } from "next/server";

const VALID_STATUSES = ["active", "paused", "completed"];
const HEX_COLOR = /^#[0-9a-fA-F]{6}$/;

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

    if (body.name !== undefined && (!body.name?.trim() || body.name.length > 200)) {
      return NextResponse.json({ error: "Invalid name" }, { status: 400 });
    }
    if (body.status !== undefined && !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 });
    }
    if (body.progress !== undefined && (typeof body.progress !== "number" || body.progress < 0 || body.progress > 100)) {
      return NextResponse.json({ error: "Progress must be 0-100" }, { status: 400 });
    }
    if (body.color !== undefined && !HEX_COLOR.test(body.color)) {
      return NextResponse.json({ error: "Invalid color" }, { status: 400 });
    }

    const result = await sql`
      UPDATE projects SET
        name = COALESCE(${body.name ?? null}, name),
        description = ${body.description !== undefined ? body.description : null},
        status = COALESCE(${body.status ?? null}, status),
        progress = COALESCE(${body.progress ?? null}, progress),
        color = COALESCE(${body.color ?? null}, color),
        url = ${body.url !== undefined ? body.url : null},
        updated_at = now()
      WHERE id = ${numId}
      RETURNING *
    `;

    if (result.length === 0) {
      return NextResponse.json({ error: "Project not found" }, { status: 404 });
    }

    return NextResponse.json({ project: result[0] });
  } catch {
    return NextResponse.json({ error: "Failed to update project" }, { status: 500 });
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
    await sql`UPDATE projects SET status = 'archived', updated_at = now() WHERE id = ${numId}`;
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Failed to archive project" }, { status: 500 });
  }
}
