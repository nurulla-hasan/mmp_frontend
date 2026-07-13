import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Inheritance Calculator</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A calculation workspace for inheritance-based land shares. It will provide guidance, not legal advice.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Land division" description="Open the general division tool." href="/tools/land-division" />
        <RouteCard title="Service guides" description="Review educational land-service guidance." href="/service-guides" />
      </section>
    </PageWrapper>
  );
}
