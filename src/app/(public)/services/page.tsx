import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Land Services</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Browse service categories and understand which type of surveyor support may fit your land-service need.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouteCard title="Boundary Identification" description="Plan an on-site boundary identification request." href="/services/boundary-identification" />
        <RouteCard title="Land Measurement" description="Request professional land measurement support." href="/services/land-measurement" />
        <RouteCard title="Land Division" description="Find support for measurement-based land division." href="/services/land-division" />
      </section>
    </PageWrapper>
  );
}
