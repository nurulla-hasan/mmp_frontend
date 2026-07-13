import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";
import { DashboardPage } from "@/components/shared/dashboard-page";

export function formatRouteValue(value: string) {
  return decodeURIComponent(value).replace(/[-_]+/g, " ").replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function PublicDynamicPage({ label, value, description }: { label: string; value: string; description: string }) {
  const formatted = formatRouteValue(value);
  return (
    <PageWrapper>
      <nav className="mb-6 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-foreground">Home</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{label}</span>
        <span aria-hidden="true"> / </span>
        <span className="text-foreground">{formatted}</span>
      </nav>
      <section className="max-w-3xl">
        <p className="mb-2 text-sm font-medium text-primary">{label}</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">{formatted}</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">{description}</p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Overview" description={`Placeholder overview for ${formatted}.`} href="#" />
        <RouteCard title="Related information" description="Supporting content will be connected here later." href="#" />
      </section>
    </PageWrapper>
  );
}

export function DashboardDynamicPage({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <DashboardPage
      title={`${label}: ${formatRouteValue(value)}`}
      description={description}
      showBack
      cards={[
        { label: "Status", value: "Placeholder", description: "Live status will appear after backend integration." },
        { label: "Activity", description: "A timeline and related records will appear here." },
      ]}
    />
  );
}
