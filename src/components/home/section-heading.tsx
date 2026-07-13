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
      <h2 className="mt-3 text-3xl font-bold tracking-tight leading-tight md:text-4xl lg:text-5xl">
        {title}
      </h2>
      {description && (
        <p className="mt-3 text-base leading-7 text-muted-foreground md:text-lg md:leading-8">
          {description}
        </p>
      )}
      {children}
    </div>
  );
}
