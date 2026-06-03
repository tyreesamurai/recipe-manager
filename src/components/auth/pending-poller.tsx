"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

export function PendingPoller() {
  const router = useRouter();

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/auth/status");
        if (!res.ok) return;
        const data = (await res.json()) as { status?: string };
        if (data.status === "approved") {
          router.push("/");
          router.refresh();
        } else if (data.status === "denied") {
          router.push("/auth/denied");
        }
      } catch {
        // Network hiccup — try again on the next tick
      }
    };

    check(); // immediate first check
    const interval = setInterval(check, 5_000);
    return () => clearInterval(interval);
  }, [router]);

  return null;
}
