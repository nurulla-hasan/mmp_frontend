import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Contact</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Contact channels, support hours, and enquiry forms will be connected here in a later phase.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Community help" description="Ask general questions in the community." href="/community" />
        <RouteCard title="Service request" description="Prepare a land-service requirement." href="/post-request" />
      </section>
    </PageWrapper>
  );
}
