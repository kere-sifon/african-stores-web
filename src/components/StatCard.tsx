import { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  className?: string;
}

export function StatCard({ label, value, icon: Icon, className }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-xl border border-border-warm bg-card-warm p-5 shadow-sm",
        className
      )}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-3xl font-heading font-semibold text-ink">{value}</p>
          <p className="mt-1 text-sm text-muted-foreground">{label}</p>
        </div>
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-forest/10 text-forest">
          <Icon className="h-5 w-5" aria-hidden />
        </span>
      </div>
    </div>
  );
}
