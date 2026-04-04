import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function RecipeCardSkeleton() {
  return (
    <Card className="flex flex-col overflow-hidden h-full border-border/60">
      {/* Accent stripe */}
      <div className="h-[3px] w-full bg-muted" />

      <CardHeader className="pb-3 pt-4">
        <div className="flex items-start justify-between gap-3">
          {/* Title */}
          <Skeleton className="h-5 w-2/3" />
          {/* Checkbox placeholder */}
          <Skeleton className="h-4 w-4 shrink-0 rounded-sm mt-0.5" />
        </div>
        {/* Description lines */}
        <div className="space-y-1.5 mt-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-4/5" />
        </div>
      </CardHeader>

      <CardContent className="pt-0 mt-auto space-y-2.5">
        {/* Time / calories row */}
        <div className="flex gap-3">
          <Skeleton className="h-3 w-16" />
          <Skeleton className="h-3 w-16" />
        </div>
        {/* Tag pills */}
        <div className="flex gap-1">
          <Skeleton className="h-5 w-14 rounded-full" />
          <Skeleton className="h-5 w-14 rounded-full" />
        </div>
      </CardContent>
    </Card>
  );
}
