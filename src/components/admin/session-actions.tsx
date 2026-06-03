"use client";

import { Check, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface ExistingUser {
  id: string;
  name: string;
  role: "admin" | "user" | null;
}

interface SessionActionsProps {
  sessionId: string;
  requesterName: string | null;
  requesterEmail: string | null;
  existingUsers: ExistingUser[];
}

export function SessionActions({
  sessionId,
  requesterName,
  requesterEmail,
  existingUsers,
}: SessionActionsProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [name, setName] = useState(requesterName ?? "");
  const [email, setEmail] = useState(requesterEmail ?? "");
  const [role, setRole] = useState<"user" | "admin">("user");
  const [linkUserId, setLinkUserId] = useState("");
  const [busy, setBusy] = useState(false);

  async function callApprove(body: object) {
    setBusy(true);
    try {
      const res = await fetch("/api/auth/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert((d as { error?: string }).error ?? "Action failed");
        return;
      }
      router.refresh();
    } finally {
      setBusy(false);
      setOpen(false);
    }
  }

  async function handleApprove() {
    if (linkUserId) {
      await callApprove({ sessionId, action: "approve", userId: linkUserId });
    } else {
      await callApprove({
        sessionId,
        action: "approve",
        newUserName: name.trim() || (requesterName ?? "Unknown"),
        newUserEmail: email.trim() || undefined,
        role,
      });
    }
  }

  async function handleDeny() {
    if (!confirm("Deny this access request?")) return;
    setBusy(true);
    try {
      await fetch("/api/auth/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId, action: "deny" }),
      });
      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="flex gap-2 items-center">
      {/* Approve dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button size="sm" className="gap-1.5" disabled={busy}>
            <Check className="h-3.5 w-3.5" />
            Approve
          </Button>
        </DialogTrigger>

        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Approve access request</DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            {/* Create as new user */}
            <div className="space-y-4">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                Create new user
              </p>

              <div className="space-y-1.5">
                <Label htmlFor="ap-name">Name</Label>
                <Input
                  id="ap-name"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setLinkUserId("");
                  }}
                  placeholder="Full name"
                  disabled={!!linkUserId}
                />
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="ap-email">
                  Email{" "}
                  <span className="text-muted-foreground font-normal text-xs">
                    (optional)
                  </span>
                </Label>
                <Input
                  id="ap-email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setLinkUserId("");
                  }}
                  placeholder="user@example.com"
                  disabled={!!linkUserId}
                />
              </div>

              <div className="space-y-1.5">
                <Label>Role</Label>
                <div className="flex gap-3">
                  {(["user", "admin"] as const).map((r) => (
                    <label
                      key={r}
                      className="flex items-center gap-2 cursor-pointer"
                    >
                      <input
                        type="radio"
                        name="ap-role"
                        value={r}
                        checked={role === r && !linkUserId}
                        onChange={() => {
                          setRole(r);
                          setLinkUserId("");
                        }}
                        className="accent-primary"
                      />
                      <span className="text-sm capitalize">{r}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Or link to existing */}
            {existingUsers.length > 0 && (
              <div className="space-y-2 border-t pt-4">
                <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Or link to existing user
                </p>
                <select
                  className="w-full text-sm rounded-md border border-input bg-background px-3 py-2"
                  value={linkUserId}
                  onChange={(e) => setLinkUserId(e.target.value)}
                >
                  <option value="">— select existing user —</option>
                  {existingUsers.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.name} ({u.role ?? "user"})
                    </option>
                  ))}
                </select>
              </div>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={busy}
              >
                Cancel
              </Button>
              <Button
                onClick={handleApprove}
                disabled={busy || (!linkUserId && !name.trim())}
              >
                {busy ? "Approving…" : "Approve"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Deny */}
      <Button
        size="sm"
        variant="ghost"
        className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
        onClick={handleDeny}
        disabled={busy}
      >
        <X className="h-3.5 w-3.5" />
        Deny
      </Button>
    </div>
  );
}
