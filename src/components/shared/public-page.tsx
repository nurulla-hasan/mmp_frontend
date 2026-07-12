import Link from "next/link";

import { RouteCard, type RouteCardProps } from "@/components/shared/route-card";
import { Button } from "@/components/ui/button";

interface PublicPageProps {
  title: string;
  description: string;
  eyebrow?: string;
  cards?: RouteCardProps[];
  primaryAction?: RouteCardProps;
  children?: React.ReactNode;
}

export function PublicPage({ title, description, eyebrow, cards = [], primaryAction, children }: PublicPageProps) {
  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 sm:py-14 lg:px-8">
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{eyebrow ?? title}</span>
      </nav>
      <section className="max-w-3xl">
        {eyebrow && <p className="mb-2 text-sm font-medium text-primary">{eyebrow}</p>}
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">{title}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
        {primaryAction && (
          <Button className="mt-6" render={<Link href={primaryAction.href} />}>
            {primaryAction.title}
          </Button>
        )}
      </section>
      {children}
      {cards.length > 0 && (
        <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => <RouteCard key={card.href} {...card} />)}
        </section>
      )}
    </main>
  );
}
