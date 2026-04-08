import { NextRequest, NextResponse } from "next/server";
import { createHash, randomBytes } from "crypto";

const TOKEN_SECRET = process.env.DASHBOARD_PASSWORD || "";

/** Hash a value with a salt for cookie tokens */
export function makeToken(): string {
  return randomBytes(32).toString("hex");
}

/** Verify the auth cookie exists and is non-empty */
export function verifyAuth(request: NextRequest | Request): boolean {
  const cookie =
    "cookies" in request && typeof request.cookies?.get === "function"
      ? (request as NextRequest).cookies.get("dashboard-auth")?.value
      : null;
  return !!cookie;
}

/** Return 401 if auth cookie is missing — call at the top of protected API routes */
export function requireAuth(request: NextRequest | Request): NextResponse | null {
  if (!verifyAuth(request as NextRequest)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  return null;
}
