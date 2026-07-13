import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Land Fraud Awareness</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          General educational checklists for safer land-service decisions. This content is not legal advice.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouteCard title="Verify records" description="Compare deed, khatian, mutation, tax, and map information." href="/service-guides/record-verification" />
        <RouteCard title="Check possession" description="Confirm real-world possession and boundaries with qualified help." href="/surveyors" />
        <RouteCard title="Use official sources" description="Follow verified government portals and offices." href="/service-guides" />
      </section>
    </PageWrapper>
  );
}
