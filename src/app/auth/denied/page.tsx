import { XCircle } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Access Denied — Recipes",
};

export default function DeniedPage() {
  return (
    <div className="w-full max-w-sm text-center">
      <div className="h-14 w-14 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-6">
        <XCircle className="h-7 w-7 text-destructive" />
      </div>

      <h1 className="text-2xl font-bold tracking-tight mb-2">Access denied</h1>
      <p className="text-sm text-muted-foreground leading-relaxed mb-8">
        Your request wasn&apos;t approved. If you think this is a mistake, you
        can submit a new request.
      </p>

      <Button asChild className="w-full">
        <Link href="/auth/request">Submit a new request</Link>
      </Button>
    </div>
  );
}
