import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Land Measurement</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Enter dimensions and calculate land area. The final calculator will be connected in a later phase.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="View other tools" description="Explore the complete land-tool collection." href="/tools" />
        <RouteCard title="Find a Surveyor" description="Get professional support for on-site measurement." href="/surveyors" />
      </section>
    </PageWrapper>
  );
}
