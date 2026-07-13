import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { SectionWrapper } from "@/components/shared/section-wrapper";

export function PublicFooter() {
  return (
    <footer className="border-t bg-card">
      <SectionWrapper padding="sm" spacing={false} className="grid gap-8 sm:grid-cols-3">
        <div>
          <Logo />
          <p className="mt-3 max-w-sm text-sm leading-6 text-muted-foreground">
            Land tools, verified surveyors, and a clearer digital land-service
            journey for Bangladesh.
          </p>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Explore</h2>
          <div className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
            <Link href="/tools" className="hover:text-primary transition-colors">Land Tools</Link>
            <Link href="/surveyors" className="hover:text-primary transition-colors">Find Surveyors</Link>
            <Link href="/post-request" className="hover:text-primary transition-colors">Post a Request</Link>
            <Link href="/#pricing" className="hover:text-primary transition-colors">Pricing</Link>
          </div>
        </div>
        <div>
          <h2 className="text-sm font-semibold">Company</h2>
          <div className="mt-3 grid gap-2.5 text-sm text-muted-foreground">
            <Link href="/about" className="hover:text-primary transition-colors">About</Link>
            <Link href="/contact" className="hover:text-primary transition-colors">Contact</Link>
            <Link href="/login" className="hover:text-primary transition-colors">Login</Link>
          </div>
        </div>
      </SectionWrapper>
      <div className="border-t py-4 text-center text-xs text-muted-foreground px-4">
        Mouza Map Pro is not a government land-record service.
      </div>
    </footer>
  );
}
