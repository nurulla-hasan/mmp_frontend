import { Check, Lock, Star } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const FREE_FEATURES = [
  "Basic Land Tools",
  "Surveyor listing দেখা",
  "Surveyor public profile দেখা",
  "Service Request তৈরি",
  "Quotation দেখা",
  "Basic account access",
];

const PRO_FEATURES = [
  "Calculation project save",
  "Multiple plot management",
  "Continue editing later",
  "PDF/Print report",
  "Advanced calculation workspace",
  "Device-based secure access",
  "Priority product updates",
];

export function FreeVsPro() {
  return (
    <SectionWrapper id="free-vs-pro" asSection>
      <SectionHeading
        badge="Access Levels"
        title="Free Access এবং Pro Access-এর পার্থক্য"
        description="আপনার প্রয়োজন অনুযায়ী Free অথবা Pro - যেকোনো একটি বেছে নিন।"
      />

      <div className="mt-10 grid gap-8 md:grid-cols-2">
        {/* Free Card */}
        <Card className="transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/5 hover:ring-1 hover:ring-primary/20">
          <CardContent className="flex flex-col">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-muted-foreground/5 text-muted-foreground">
              <Lock className="size-6" />
            </div>
            <h3 className="text-lg font-semibold font-heading">Free Access</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Platform ও basic land-service workflow পরিচিত হওয়ার জন্য।
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold tracking-tight md:text-5xl font-heading">
                ৳০
              </span>
              <span className="ml-1 text-sm text-muted-foreground">সর্বদা</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-5 text-muted-foreground italic">
              Free সুবিধা ও usage limit launch policy অনুযায়ী নির্ধারিত হবে।
            </p>
          </CardContent>
        </Card>

        {/* Pro Card */}
        <Card className="relative overflow-visible ring-2 ring-primary shadow-lg shadow-primary/10 transition-all duration-300 hover:-translate-y-2 hover:shadow-xl hover:shadow-primary/15">
          {/* Glow bg */}
          <div className="pointer-events-none absolute -inset-px rounded-[calc(var(--radius-xl)+1px)] bg-linear-to-b from-primary/5 via-transparent to-transparent opacity-60" />

          {/* Badge */}
          <span className="absolute -top-3 right-6 z-10 rounded-full bg-primary px-4 py-1 text-xs font-medium text-primary-foreground shadow-lg shadow-primary/20">
            Pro
          </span>

          <CardContent className="relative flex flex-col">
            <div className="mb-4 flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary shadow-sm">
              <Star className="size-6" />
            </div>
            <h3 className="text-lg font-semibold font-heading">Pro Access</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Calculation workspace ও professional report-এর advanced সুবিধার জন্য।
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold tracking-tight md:text-5xl font-heading">
                ৳৯৯
              </span>
              <span className="ml-1 text-sm text-muted-foreground">/মাস থেকে</span>
            </div>
            <ul className="mt-6 flex-1 space-y-3">
              {PRO_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                    <Check className="size-3 text-primary" />
                  </span>
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-5 text-muted-foreground italic">
              Pro সুবিধা plan policy অনুযায়ী উপলব্ধ হবে।
            </p>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
