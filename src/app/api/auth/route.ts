import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";

// Simple in-memory rate limit: max 5 attempts per IP per 15 minutes
const attempts = new Map<string, { count: number; resetAt: number }>();

function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || now > entry.resetAt) {
    attempts.set(ip, { count: 1, resetAt: now + 15 * 60 * 1000 });
    return false;
  }
  entry.count++;
  return entry.count > 5;
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || "unknown";
    if (isRateLimited(ip)) {
      return NextResponse.json(
        { error: "Too many attempts. Try again later." },
        { status: 429 }
      );
    }

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

    // Generate a cryptographically random token
    const token = randomBytes(32).toString("hex");

    const response = NextResponse.json({ ok: true });
    response.cookies.set("dashboard-auth", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      maxAge: 60 * 60 * 24 * 30,
      path: "/",
      sameSite: "strict",
    });

    return response;
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}

export async function DELETE() {
  const response = NextResponse.json({ ok: true });
  response.cookies.delete("dashboard-auth");
  return response;
}
