import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type HeadingAlignment = "left" | "center";

interface SectionHeadingProps {
  badge?: string;
  title: string;
  description?: string;
  alignment?: HeadingAlignment;
  className?: string;
  children?: ReactNode;
}

const alignmentClasses: Record<HeadingAlignment, string> = {
  left: "text-left",
  center: "text-center",
};

export function SectionHeading({
  badge,
  title,
  description,
  alignment = "center",
  className,
  children,
}: SectionHeadingProps) {
  return (
    <div className={cn("max-w-2xl", alignment === "center" && "mx-auto", alignmentClasses[alignment], className)}>
      {badge && (
        <span className="inline-block rounded-full border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
          {badge}
        </span>
      )}
      <h2 className="mt-3 text-2xl font-semibold tracking-tight sm:text-3xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
