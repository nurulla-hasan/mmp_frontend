import Link from "next/link";

import { Logo } from "@/components/shared/logo";

export function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <div className="mx-auto grid w-full max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-3 lg:px-8">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">Land tools, verified surveyors, and a clearer digital land-service journey for Bangladesh.</p>
        </div>
        <div>
          <h2 className="text-sm font-medium">Explore</h2>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/tools">Land Tools</Link>
            <Link href="/surveyors">Find Surveyors</Link>
            <Link href="/service-guides">Service Guides</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-medium">Company</h2>
          <div className="mt-3 grid gap-2 text-sm text-muted-foreground">
            <Link href="/about">About</Link>
            <Link href="/contact">Contact</Link>
            <Link href="/fraud-awareness">Fraud Awareness</Link>
          </div>
        </div>
      </div>
      <div className="border-t py-4 text-center text-xs text-muted-foreground">Mouza Map Pro is not a government land-record service.</div>
    </footer>
  );
}
