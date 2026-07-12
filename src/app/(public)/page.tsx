import Link from "next/link";

import { RouteCard } from "@/components/shared/route-card";
import { Button } from "@/components/ui/button";

const highlights = [
  { title: "Land Tools", description: "Measure, divide, and convert land-area units with practical tools.", href: "/tools" },
  { title: "Verified Surveyors", description: "Explore surveyor profiles, service areas, experience, and reviews.", href: "/surveyors" },
  { title: "Post a Requirement", description: "Describe your land-service need and prepare to compare quotations.", href: "/post-request" },
];

export default function HomePage() {
  return (
    <main>
      <section className="border-b">
        <div className="mx-auto grid w-full max-w-7xl gap-10 px-4 py-16 sm:px-6 sm:py-24 lg:grid-cols-[1.2fr_0.8fr] lg:px-8">
          <div>
            <p className="text-sm font-medium text-primary">Land services, made clearer</p>
            <h1 className="mt-3 max-w-3xl text-4xl font-semibold tracking-tight sm:text-5xl">Tools and trusted surveyor connections for Bangladesh.</h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-muted-foreground">Mouza Map Pro brings land calculations, service guidance, surveyor discovery, quotations, and job tracking into one focused platform.</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button size="lg" nativeButton={false} render={<Link href="/surveyors" />}>Find a Surveyor</Button>
              <Button size="lg" variant="outline" nativeButton={false} render={<Link href="/tools" />}>Explore Land Tools</Button>
            </div>
          </div>
          <div className="grid gap-3 rounded-2xl border bg-card p-5 sm:grid-cols-2 lg:grid-cols-1">
            <div className="rounded-xl bg-muted p-5"><p className="text-sm text-muted-foreground">Platform status</p><p className="mt-2 font-medium">Frontend foundation ready</p></div>
            <div className="rounded-xl bg-muted p-5"><p className="text-sm text-muted-foreground">Coming later</p><p className="mt-2 font-medium">Live listings, quotations, and reports</p></div>
          </div>
        </div>
      </section>
      <section className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <h2 className="text-2xl font-semibold">Start with what you need</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">{highlights.map((card) => <RouteCard key={card.href} {...card} />)}</div>
      </section>
    </main>
  );
}
