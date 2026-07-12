import { MapPinned } from "lucide-react";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <span className="flex size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <MapPinned className="size-4" aria-hidden="true" />
      </span>
      <span>Mouza Map Pro</span>
    </Link>
  );
}
