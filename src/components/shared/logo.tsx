import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <Link href="/" className={cn("inline-flex items-center gap-2 font-semibold tracking-tight", className)}>
      <Image
        src="/assets/logo.png"
        alt="Mouza Map Pro"
        width={0}
        height={0}
        sizes="32px"
        className="h-auto w-auto rounded-lg"
      />
    </Link>
  );
}
