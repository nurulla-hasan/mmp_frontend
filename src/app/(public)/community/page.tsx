import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Community Q&A</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Ask land-service questions and learn from verified surveyors and community experts.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <RouteCard title="RS and BS Khatian" description="View a sample record-related discussion." href="/community/questions/rs-vs-bs-khatian" />
        <RouteCard title="Boundary mismatch" description="View a sample boundary question." href="/community/questions/boundary-mismatch" />
        <RouteCard title="Ask a question" description="Prepare a new community question." href="/community/ask" />
      </section>
    </PageWrapper>
  );
}
