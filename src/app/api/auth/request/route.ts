import { cookies } from "next/headers";
import { z } from "zod";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { signSession } from "@/lib/auth";
import { extractClientIp } from "@/lib/ip";
import type { Session } from "@/lib/types";

const requestSchema = z.object({
  name: z.string().min(1),
  email: z.email().optional(),
});

export async function POST(request: Request) {
  let body: unknown;

  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const result = requestSchema.safeParse(body);

  if (!result.success) {
    return Response.json({ error: "Name is required" }, { status: 400 });
  }

  const { name, email } = result.data;
  const cookieStore = await cookies();

  const [inserted] = await db
    .insert(schema.sessions)
    .values({
      requesterName: name,
      requesterEmail: email,
      ipAddress: extractClientIp(request),
      userAgent: request.headers.get("user-agent"),
    })
    .returning();

  const session: Session = {
    sid: inserted.id,
    uid: null,
    role: null,
    status: "pending",
  };

  const token = await signSession(session);

  cookieStore.set("__Host-session", token, {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 30,
    path: "/",
  });

  return Response.json({ ok: true }, { status: 201 });
}
