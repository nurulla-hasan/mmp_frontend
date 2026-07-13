import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Land Service Guides</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Educational guides explaining common land-service steps, documents, official portals, and when professional help may be useful.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouteCard title="Preparing for Land Measurement" description="A checklist for an on-site measurement visit." href="/service-guides/preparing-for-land-measurement" />
        <RouteCard title="Understanding Khatian Records" description="A plain-language record overview." href="/service-guides/understanding-khatian" />
        <RouteCard title="Boundary Verification" description="Common preparation and safety considerations." href="/service-guides/boundary-verification" />
      </section>
    </PageWrapper>
  );
}
