import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Land Division</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A foundation for dividing a measured land area among multiple shares.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Saved calculations" description="Your saved division results will appear in the dashboard." href="/dashboard/calculations" />
        <RouteCard title="Service guide" description="Learn what to prepare before dividing land." href="/service-guides/land-division" />
      </section>
    </PageWrapper>
  );
}
