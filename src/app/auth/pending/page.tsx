import { Clock } from "lucide-react";
import { PendingPoller } from "@/components/auth/pending-poller";

export const metadata = {
  title: "Awaiting Approval — Recipes",
};

export default function PendingPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <PendingPoller />

      <div className="h-14 w-14 rounded-full bg-amber-500/10 flex items-center justify-center mx-auto mb-6">
        <Clock className="h-7 w-7 text-amber-500" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">
        Awaiting approval
      </h1>
      <p className="text-sm text-muted-foreground leading-relaxed">
        Your request has been submitted. An admin will review it shortly. This
        page will automatically update when you&apos;re approved — no need to
        refresh.
      </p>

      <p className="text-xs text-muted-foreground/60 mt-8">
        Checking every 5 seconds…
      </p>
    </div>
  );
}
