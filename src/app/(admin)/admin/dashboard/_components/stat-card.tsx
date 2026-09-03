import type { LucideIcon } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface StatCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon: LucideIcon;
  badgeText?: string;
  badgeVariant?: "active" | "pending" | "info" | "progress" | "admin" | "default" | "outline";
}

export function StatCard({
  title,
  value,
  description,
  icon: Icon,
  badgeText,
  badgeVariant = "outline",
}: StatCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-4 transition-all shadow-xs flex flex-col justify-between">
      <div className="flex items-center justify-between gap-2">
        <span className="text-xs font-medium text-muted-foreground">{title}</span>
        <div className="flex size-7 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Icon className="size-3.5" />
        </div>
      </div>

      <div className="mt-3 flex items-baseline justify-between gap-2">
        <span className="text-2xl font-bold text-foreground tracking-tight font-mono">
          {typeof value === "number" ? value.toLocaleString() : value}
        </span>
        {badgeText && (
          <Badge variant={badgeVariant}>
            {badgeText}
          </Badge>
        )}
      </div>

      {description && (
        <p className="mt-1.5 text-xs text-muted-foreground line-clamp-1">
          {description}
        </p>
      )}
    </div>
  );
}

