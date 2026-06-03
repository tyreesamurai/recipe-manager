export const dynamic = "force-dynamic";

import { desc, eq } from "drizzle-orm";
import { Clock3, Shield, Users } from "lucide-react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { SessionActions } from "@/components/admin/session-actions";
import { Badge } from "@/components/ui/badge";
import { db } from "@/db/index";
import * as schema from "@/db/schema";
import { verifySession } from "@/lib/auth";

function timeAgo(date: Date | null | undefined): string {
  if (!date) return "—";
  const s = Math.floor((Date.now() - date.getTime()) / 1000);
  if (s < 60) return "just now";
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m ago`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h ago`;
  return `${Math.floor(h / 24)}d ago`;
}

function parseUa(ua: string | null | undefined): string {
  if (!ua) return "Unknown";
  if (ua.includes("Firefox")) return "Firefox";
  if (ua.includes("Edg/")) return "Edge";
  if (ua.includes("Chrome")) return "Chrome";
  if (ua.includes("Safari")) return "Safari";
  if (ua.includes("curl")) return "curl";
  return ua.slice(0, 40);
}

export default async function AdminPage() {
  // ── Auth guard ────────────────────────────────────────────────────────────
  const cookieStore = await cookies();
  const token = cookieStore.get("__Host-session")?.value;
  const session = token ? await verifySession(token) : null;

  if (!session || session.role !== "admin" || session.status !== "approved") {
    redirect("/");
  }

  // ── Data ──────────────────────────────────────────────────────────────────
  const [pendingSessions, allUsers] = await Promise.all([
    db
      .select()
      .from(schema.sessions)
      .where(eq(schema.sessions.status, "pending"))
      .orderBy(desc(schema.sessions.createdAt)),
    db.select().from(schema.users).orderBy(schema.users.name),
  ]);

  const existingUsersForDialog = allUsers.map((u) => ({
    id: u.id,
    name: u.name,
    role: u.role,
  }));

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8 space-y-10">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <Shield className="h-5 w-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Admin</h1>
          <p className="text-sm text-muted-foreground">
            Manage access requests and users.
          </p>
        </div>
        {pendingSessions.length > 0 && (
          <Badge variant="destructive" className="ml-auto">
            {pendingSessions.length} pending
          </Badge>
        )}
      </div>

      {/* ── Pending Requests ─────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Clock3 className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Pending Requests
          </h2>
        </div>

        {pendingSessions.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
            No pending requests — you&apos;re all caught up.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    IP
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden lg:table-cell">
                    Browser
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    When
                  </th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y">
                {pendingSessions.map((s) => (
                  <tr
                    key={s.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">
                      {s.requesterName ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {s.requesterEmail ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs hidden md:table-cell">
                      {s.ipAddress ?? "—"}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground hidden lg:table-cell">
                      {parseUa(s.userAgent)}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {timeAgo(s.createdAt)}
                    </td>
                    <td className="px-4 py-3">
                      <SessionActions
                        sessionId={s.id}
                        requesterName={s.requesterName}
                        requesterEmail={s.requesterEmail}
                        existingUsers={existingUsersForDialog}
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      {/* ── Users ─────────────────────────────────────────────────────────── */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <Users className="h-4 w-4 text-muted-foreground" />
          <h2 className="font-semibold text-sm uppercase tracking-widest text-muted-foreground">
            Users
          </h2>
        </div>

        {allUsers.length === 0 ? (
          <p className="text-sm text-muted-foreground py-6 text-center border border-dashed rounded-lg">
            No users yet.
          </p>
        ) : (
          <div className="rounded-lg border overflow-hidden">
            <table className="w-full text-sm">
              <thead className="bg-muted/50 border-b">
                <tr>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Name
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden sm:table-cell">
                    Email
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground">
                    Role
                  </th>
                  <th className="text-left px-4 py-3 font-medium text-muted-foreground hidden md:table-cell">
                    Joined
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {allUsers.map((u) => (
                  <tr
                    key={u.id}
                    className="hover:bg-muted/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-muted-foreground hidden sm:table-cell">
                      {u.email ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <Badge
                        variant={u.role === "admin" ? "default" : "secondary"}
                      >
                        {u.role ?? "user"}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs hidden md:table-cell">
                      {timeAgo(u.createdAt)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </div>
  );
}
