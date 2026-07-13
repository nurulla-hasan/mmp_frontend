import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Ask the Community</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Prepare a clear land-service question. Posting will be enabled after authentication and backend integration.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Browse questions" description="Review existing community discussions." href="/community" />
        <RouteCard title="Fraud awareness" description="Check general safety guidance first." href="/fraud-awareness" />
      </section>
    </PageWrapper>
  );
}
