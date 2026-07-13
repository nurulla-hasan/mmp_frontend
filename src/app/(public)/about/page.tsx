
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">About Mouza Map Pro</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A focused platform concept connecting practical land tools, verified surveyors, guided service workflows, and educational content.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Explore tools" description="See the land calculation foundation." href="/tools" />
        <RouteCard title="Find surveyors" description="Browse professional profiles." href="/surveyors" />
      </section>
    </PageWrapper>
  );
}
