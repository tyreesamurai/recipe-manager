"use client";

import { Flame, Thermometer } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

type ActionStatus = "idle" | "loading" | "ok" | "error";

const MODES = [
  { key: "M1", label: "Black Tea", tempF: 212, tempC: 100 },
  { key: "M2", label: "Green Tea", tempF: 180, tempC: 82 },
  { key: "M3", label: "Oolong Tea", tempF: 195, tempC: 91 },
  { key: "M4", label: "Coffee", tempF: 205, tempC: 96 },
] as const;

type ModeKey = (typeof MODES)[number]["key"];

async function kettleAction(body: Record<string, unknown>): Promise<boolean> {
  const res = await fetch("/api/kettle", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  }).catch(() => null);
  return res?.ok ?? false;
}

export function KettleControl() {
  const [powerStatus, setPowerStatus] = useState<ActionStatus>("idle");
  const [activeMode, setActiveMode] = useState<ModeKey | null>(null);
  const [modeStatus, setModeStatus] = useState<ActionStatus>("idle");
  const [customTemp, setCustomTemp] = useState("");
  const [tempStatus, setTempStatus] = useState<ActionStatus>("idle");

  const handlePower = async (on: boolean) => {
    setPowerStatus("loading");
    const ok = await kettleAction({ action: on ? "on" : "off" });
    setPowerStatus(ok ? "ok" : "error");
    if (ok) setActiveMode(null);
    setTimeout(() => setPowerStatus("idle"), 2500);
  };

  const handleMode = async (mode: ModeKey) => {
    setModeStatus("loading");
    setActiveMode(mode);
    const ok = await kettleAction({ action: "mode", mode });
    setModeStatus(ok ? "ok" : "error");
    if (!ok) setActiveMode(null);
    setTimeout(() => setModeStatus("idle"), 2500);
  };

  const handleTemp = async () => {
    const val = Number(customTemp);
    if (!customTemp || Number.isNaN(val)) return;
    setTempStatus("loading");
    const ok = await kettleAction({
      action: "temperature",
      temperature: val,
      unit: "Fahrenheit",
    });
    setTempStatus(ok ? "ok" : "error");
    setTimeout(() => setTempStatus("idle"), 2500);
  };

  return (
    <Card className="overflow-hidden border-border/60">
      <div className="h-[3px] w-full bg-primary" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-4 w-4 text-accent" />
            <CardTitle className="text-base">Kettle</CardTitle>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5 pb-5">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Power
          </p>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="default"
              disabled={powerStatus === "loading"}
              onClick={() => handlePower(true)}
              className="flex-1"
            >
              Turn On
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={powerStatus === "loading"}
              onClick={() => handlePower(false)}
              className="flex-1"
            >
              Turn Off
            </Button>
          </div>
          <StatusLine status={powerStatus} />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Presets
          </p>
          <div className="grid grid-cols-2 gap-2">
            {MODES.map((m) => (
              <button
                key={m.key}
                type="button"
                disabled={modeStatus === "loading"}
                onClick={() => handleMode(m.key)}
                className={[
                  "rounded-md border px-3 py-2.5 text-left transition-colors",
                  activeMode === m.key
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border/60 bg-card hover:border-primary/40 hover:bg-muted/50",
                  modeStatus === "loading" && activeMode === m.key
                    ? "opacity-60"
                    : "",
                ].join(" ")}
              >
                <span className="block text-[13px] font-semibold leading-tight">
                  {m.label}
                </span>
                <span className="block text-[11px] text-muted-foreground mt-0.5">
                  {m.tempF}°F / {m.tempC}°C
                </span>
              </button>
            ))}
          </div>
          <StatusLine status={modeStatus} />
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            <span className="flex items-center gap-1">
              <Thermometer className="h-3 w-3" />
              Custom temperature (°F)
            </span>
          </p>
          <div className="flex gap-2">
            <Input
              type="number"
              min={104}
              max={212}
              placeholder="e.g. 190"
              value={customTemp}
              onChange={(e) => setCustomTemp(e.target.value)}
              className="h-8 text-sm"
              onKeyDown={(e) => e.key === "Enter" && handleTemp()}
            />
            <Button
              size="sm"
              variant="outline"
              disabled={tempStatus === "loading" || !customTemp}
              onClick={handleTemp}
              className="shrink-0"
            >
              Set
            </Button>
          </div>
          <StatusLine status={tempStatus} />
        </div>
      </CardContent>
    </Card>
  );
}

function StatusLine({ status }: { status: ActionStatus }) {
  if (status === "idle") return null;
  return (
    <p
      className={[
        "text-[11px] mt-1.5 font-medium",
        status === "loading" && "text-muted-foreground animate-pulse",
        status === "ok" && "text-green-600 dark:text-green-400",
        status === "error" && "text-destructive",
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {status === "loading" && "Sending…"}
      {status === "ok" && "Done ✓"}
      {status === "error" && "Something went wrong — try again"}
    </p>
  );
}
