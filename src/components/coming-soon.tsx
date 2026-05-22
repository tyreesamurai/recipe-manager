import { ChefHat } from "lucide-react";

interface ComingSoonProps {
  feature: string;
  description?: string;
}

export function ComingSoon({ feature, description }: ComingSoonProps) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-4 text-center">
      <div className="mb-6 relative">
        <div className="h-20 w-20 rounded-full bg-muted flex items-center justify-center">
          <ChefHat className="h-9 w-9 text-muted-foreground" />
        </div>
        <div className="absolute inset-0 rounded-full border-2 border-dashed border-border animate-spin [animation-duration:12s]" />
      </div>

      <p className="text-xs font-semibold tracking-widest uppercase text-muted-foreground mb-3">
        Coming Soon
      </p>

      <h1 className="text-3xl font-bold tracking-tight mb-3">{feature}</h1>

      <p className="text-muted-foreground max-w-sm leading-relaxed">
        {description ?? "This feature is still being crafted. Check back soon."}
      </p>
    </div>
  );
}
