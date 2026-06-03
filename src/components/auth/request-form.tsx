"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RequestForm({ redirect }: { redirect?: string }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phase, setPhase] = useState<"idle" | "loading" | "error">("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setPhase("loading");
    setErrorMsg("");

    try {
      const res = await fetch("/api/auth/request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: name.trim(),
          email: email.trim() || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setErrorMsg(
          (data as { error?: string }).error ??
            "Something went wrong. Please try again.",
        );
        setPhase("error");
        return;
      }

      const dest = redirect?.startsWith("/") ? redirect : "/auth/pending";
      router.push(dest === "/" ? "/auth/pending" : "/auth/pending");
    } catch {
      setErrorMsg("Network error. Please check your connection and try again.");
      setPhase("error");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="space-y-1.5">
        <Label htmlFor="name">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
          required
          autoFocus
          disabled={phase === "loading"}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor="email">
          Email{" "}
          <span className="text-muted-foreground text-xs font-normal">
            (optional)
          </span>
        </Label>
        <Input
          id="email"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          disabled={phase === "loading"}
        />
      </div>

      {phase === "error" && (
        <p className="text-sm text-destructive">{errorMsg}</p>
      )}

      <Button
        type="submit"
        className="w-full"
        disabled={phase === "loading" || !name.trim()}
      >
        {phase === "loading" ? "Sending request…" : "Request Access"}
      </Button>
    </form>
  );
}
