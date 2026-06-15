"use client";

import { Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";

interface UserActionsProps {
  userId: string;
  userName: string;
}

export function UserActions({ userId, userName }: UserActionsProps) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);

  async function handleRemove() {
    if (
      !confirm(
        `Remove ${userName}? They will be immediately logged out and will need to request access again.`,
      )
    ) {
      return;
    }

    setBusy(true);
    try {
      const res = await fetch(`/api/auth/users/${userId}`, {
        method: "DELETE",
      });

      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        alert((d as { error?: string }).error ?? "Failed to remove user");
        return;
      }

      router.refresh();
    } finally {
      setBusy(false);
    }
  }

  return (
    <Button
      size="sm"
      variant="ghost"
      className="gap-1.5 text-destructive hover:text-destructive hover:bg-destructive/10"
      onClick={handleRemove}
      disabled={busy}
    >
      <Trash2 className="h-3.5 w-3.5" />
      Remove
    </Button>
  );
}
