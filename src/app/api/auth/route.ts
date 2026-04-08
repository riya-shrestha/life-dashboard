import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";

export async function POST(request: NextRequest) {
  try {
    const { password } = await request.json();
    const expected = process.env.DASHBOARD_PASSWORD;

    if (!expected) {
      return NextResponse.json(
        { error: "Server misconfigured" },
        { status: 500 }
      );
    }

    if (password !== expected) {
      return NextResponse.json({ error: "Wrong password" }, { status: 401 });
    }

    // Create a token by hashing the password
    const token = createHash("sha256").update(password).digest("hex");

    const response = NextResponse.json({ ok: true });
    response.cookies.set("dashboard-auth", token, {
      httpOnly: true,
      maxAge: 60 * 60 * 24 * 30, // 30 days
      path: "/",
      sameSite: "lax",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
