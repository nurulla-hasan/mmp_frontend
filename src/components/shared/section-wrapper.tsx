import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type SectionWrapperProps = {
  children: ReactNode;
  className?: string;
  /** Constrain content width (default: true) */
  container?: boolean;
  /** Add bottom padding for spacing between sections (default: true) */
  spacing?: boolean;
  /** Use as a semantic <section> element (default: true) */
  asSection?: boolean;
  /** Vertical padding preset: "none" | "sm" | "md" | "lg" | "xl" (default: "md") */
  padding?: "none" | "sm" | "md" | "lg" | "xl";
};

const paddingMap: Record<string, string> = {
  none: "",
  sm: "py-8 md:py-10",
  md: "py-12 md:py-16",
  lg: "py-16 sm:py-24",
  xl: "py-20 sm:py-32",
};

function SectionWrapper({
  children,
  className,
  container = true,
  spacing = true,
  asSection = true,
  padding = "md",
}: SectionWrapperProps) {
  const Tag = asSection ? "section" : "div";

  return (
    <Tag
      className={cn(
        container && "mx-auto w-full max-w-7xl px-4 md:px-6",
        spacing && "mb-8 md:mb-12 last:mb-0",
        paddingMap[padding],
        className,
      )}
    >
      {children}
    </Tag>
  );
}

export { SectionWrapper };
