import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { signSession, verifySession } from "@/lib/auth";
import type { Session } from "@/lib/types";

export async function GET() {
  const cookieStore = await cookies();

  const token = cookieStore.get("__Host-session")?.value;

  if (!token) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const session = await verifySession(token);

  if (!session) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [dbSession] = await db
    .select()
    .from(schema.sessions)
    .where(eq(schema.sessions.id, session.sid));

  if (!dbSession) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  if (dbSession.status === "pending") {
    return Response.json({ status: "pending" }, { status: 200 });
  }

  if (dbSession.status === "denied") {
    return Response.json({ status: "denied" }, { status: 401 });
  }

  if (!dbSession.userId || dbSession.status !== "approved") {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [user] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.id, dbSession.userId))
    .limit(1);

  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }

  const newSession: Session = {
    sid: session.sid,
    uid: user.id,
    role: user.role,
    status: "approved",
  };

  const newToken = await signSession(newSession);

  cookieStore.set("__Host-session", newToken, {
    httpOnly: true,
    secure: true,
    path: "/",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
  });

  return Response.json({ status: "approved" }, { status: 200 });
}
