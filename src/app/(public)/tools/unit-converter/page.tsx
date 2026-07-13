import Link from "next/link";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { RouteCard } from "@/components/shared/route-card";

export default function Page() {
  return (
    <PageWrapper>
      <section className="max-w-3xl">
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl font-heading">Unit Converter</h1>
        <p className="mt-4 text-base leading-7 text-muted-foreground">
          Convert land-area values between commonly used Bangladeshi and international units.
        </p>
      </section>
      <section className="mt-10 grid gap-4 sm:grid-cols-2">
        <RouteCard title="Area converter" description="Open the focused area conversion tool." href="/tools/area-converter" />
        <RouteCard title="Land measurement" description="Calculate an area before converting it." href="/tools/land-measurement" />
      </section>
    </PageWrapper>
  );
}
