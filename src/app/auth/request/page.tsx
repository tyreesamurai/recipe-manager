import { ChefHat } from "lucide-react";
import { RequestForm } from "@/components/auth/request-form";

export const metadata = {
  title: "Request Access — Recipes",
};

export default async function RequestAccessPage({
  searchParams,
}: {
  searchParams: Promise<{ redirect?: string }>;
}) {
  const { redirect } = await searchParams;

  return (
    <div className="w-full max-w-sm">
      {/* Brand mark */}
      <div className="flex items-center gap-2 mb-8">
        <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
          <ChefHat className="h-5 w-5 text-primary" />
        </div>
        <span
          className="font-bold text-xl tracking-[-0.04em]"
          style={{ fontFamily: "var(--font-fraunces), Georgia, serif" }}
        >
          Recipes
        </span>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-bold tracking-tight mb-1.5">
          Request access
        </h1>
        <p className="text-sm text-muted-foreground leading-relaxed">
          This app is private. Submit your name and an admin will review your
          request. You&apos;ll hear back soon.
        </p>
      </div>

      <RequestForm redirect={redirect} />
    </div>
  );
}
