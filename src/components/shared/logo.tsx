import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "sm",
  showText = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
  showText?: boolean;
}) {
  const pixelSize = size === "lg" ? 48 : size === "md" ? 40 : 32;

  return (
    <Link
      href="/"
      className={cn(
        "inline-flex items-center gap-3 font-semibold tracking-tight",
        className,
      )}
    >
      <Image
        src="/assets/logo.png"
        alt="Mouza Map Pro"
        width={0}
        height={0}
        sizes={`${pixelSize}px`}
        className={cn(
          "h-auto w-auto rounded-lg",
          size === "lg" && "max-h-12",
          size === "md" && "max-h-10",
          size === "sm" && "max-h-8",
        )}
      />
      {showText && (
        <span
          className={cn(
            "font-heading font-bold text-foreground",
            size === "lg" && "text-xl",
            size === "md" && "text-lg",
            size === "sm" && "text-base",
          )}
        >
          Mouza Map Pro
        </span>
      )}
    </Link>
  );
}
