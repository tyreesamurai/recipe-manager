import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { signSession } from "@/lib/auth";
import { extractClientIp, isLocalIp, isTailscaleIp } from "@/lib/ip";
import type { Session } from "@/lib/session";

export async function GET(request: Request) {
  const ip = extractClientIp(request);

  if (!ip) {
    return Response.json(
      { error: "Unable to read request IP" },
      { status: 500 },
    );
  }

  if (!isLocalIp(ip) && !isTailscaleIp(ip)) {
    return Response.json({ error: "Forbidden" }, { status: 403 });
  }

  // Find or create the "tyree" admin user that local/Tailscale access maps to
  let [admin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.name, "tyree"));

  if (!admin) {
    [admin] = await db
      .insert(schema.users)
      .values({ name: "tyree", role: "admin" })
      .returning();
  }

  // Create a short-lived (8h) approved session — auto-renewed on every local visit
  const [inserted] = await db
    .insert(schema.sessions)
    .values({
      userId: admin.id,
      status: "approved",
      ipAddress: ip,
      userAgent: request.headers.get("user-agent"),
      expiresAt: new Date(Date.now() + 8 * 60 * 60 * 1000),
    })
    .returning();

  const session: Session = {
    sid: inserted.id,
    uid: admin.id,
    role: "admin",
    status: "approved",
  };

  const token = await signSession(session);

  const redirectTo = new URL(request.url).searchParams.get("redirect") ?? "/";
  const safeRedirect = redirectTo.startsWith("/") ? redirectTo : "/";

  const response = NextResponse.redirect(new URL(safeRedirect, request.url));

  response.cookies.set("__Host-session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 8,
    path: "/",
  });

  return response;
}
