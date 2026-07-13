import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Post Your Land Requirement</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Describe the location, land area, service type, preferred date, and budget. Surveyors will be able to submit quotations later.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Browse Surveyors" description="Review surveyor profiles before posting." href="/surveyors" />
      </section>
    </PageWrapper>
  );
}
