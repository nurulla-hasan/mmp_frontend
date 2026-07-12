import { ArrowRight } from "lucide-react";
import Link from "next/link";

export interface RouteCardProps {
  title: string;
  description: string;
  href: string;
}

export function RouteCard({ title, description, href }: RouteCardProps) {
  return (
    <Link href={href} className="group rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="font-medium">{title}</h2>
          <p className="mt-1 text-sm leading-6 text-muted-foreground">{description}</p>
        </div>
        <ArrowRight className="mt-1 size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </div>
    </Link>
  );
}
