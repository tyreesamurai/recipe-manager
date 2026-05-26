export const dynamic = "force-dynamic";

import { ChefHat, Package, Sparkles } from "lucide-react";
import { KettleControl } from "@/components/kettle/kettle-control";

interface ComingTileProps {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function ComingTile({ icon, title, description }: ComingTileProps) {
  return (
    <div className="rounded-xl border border-dashed border-border/60 bg-muted/20 p-5 flex flex-col gap-3 opacity-60">
      <div className="h-8 w-8 rounded-md bg-muted flex items-center justify-center text-muted-foreground">
        {icon}
      </div>
      <div>
        <p className="text-sm font-semibold text-foreground">{title}</p>
        <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
          {description}
        </p>
      </div>
      <span className="mt-auto text-[10px] font-semibold uppercase tracking-widest text-muted-foreground/70">
        Coming soon
      </span>
    </div>
  );
}

export default function Management() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold tracking-tight">Management</h1>
        <p className="text-sm text-muted-foreground mt-1.5">
          Control your kitchen devices and manage your setup. More sections are
          on the way.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 items-start">
        <KettleControl />

        <ComingTile
          icon={<ChefHat className="h-4 w-4" />}
          title="Recipe Collection"
          description="Bulk-edit, archive, or reorganise all your recipes from one place."
        />
        <ComingTile
          icon={<Package className="h-4 w-4" />}
          title="Pantry Tracker"
          description="Track what's in stock and get notified when staples run low."
        />
        <ComingTile
          icon={<Sparkles className="h-4 w-4" />}
          title="More to Come"
          description="Additional smart-home integrations and kitchen tools are planned."
        />
      </div>
    </div>
  );
}
