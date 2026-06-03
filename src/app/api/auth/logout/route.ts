import { eq } from "drizzle-orm";
import { cookies } from "next/headers";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { requireAuth } from "@/lib/auth";

export async function POST(request: Request) {
  const cookieStore = await cookies();

  try {
    const session = await requireAuth(request);
    await db
      .update(schema.sessions)
      .set({ status: "expired" })
      .where(eq(schema.sessions.id, session.sid));
  } catch {
    // session already invalid — still clear the cookie below
  }

  cookieStore.set("__Host-session", "", {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: "/",
    maxAge: 0,
  });

  return Response.json({ ok: true });
}
