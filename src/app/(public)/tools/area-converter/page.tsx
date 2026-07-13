
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Area Converter</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          A quick conversion workspace for decimal, katha, bigha, acre, and square units.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Unit converter" description="Open the extended unit converter." href="/tools/unit-converter" />
        <RouteCard title="Save calculations" description="Access calculation history in your dashboard." href="/dashboard/calculations" />
      </section>
    </PageWrapper>
  );
}
