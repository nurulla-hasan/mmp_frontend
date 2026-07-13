import { Check } from "lucide-react";

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
    <SectionWrapper id="free-vs-pro" asSection bg="muted">
      <SectionHeading
          badge="Access Levels"
          title="Free Access এবং Pro Access-এর পার্থক্য"
        />

        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <Card className="transition-all duration-200 hover:shadow-md">
            <CardContent className="flex flex-col p-6">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-muted">
                <svg
                  className="size-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold font-heading">Free Access</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Platform ও basic land-service workflow পরিচিত হওয়ার জন্য।
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {FREE_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground/60" />
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground italic">
                Free সুবিধা ও usage limit launch policy অনুযায়ী নির্ধারিত হবে।
              </p>
            </CardContent>
          </Card>

          <Card className="relative overflow-visible ring-1 ring-primary/30 bg-linear-to-b from-primary/2 to-transparent shadow-sm transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5">
            <span className="absolute -top-2.5 right-4 rounded-full bg-primary px-2.5 py-0.5 text-[10px] font-medium text-primary-foreground">
              Pro
            </span>
            <CardContent className="flex flex-col p-6">
              <div className="mb-4 flex size-11 items-center justify-center rounded-full bg-primary/10">
                <svg
                  className="size-5 text-primary"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1.5}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.455 2.456L21.75 6l-1.036.259a3.375 3.375 0 0 0-2.455 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-semibold font-heading">Pro Access</h3>
              <p className="mt-1.5 text-sm text-muted-foreground">
                Calculation workspace ও professional report-এর advanced সুবিধার জন্য।
              </p>
              <ul className="mt-6 flex-1 space-y-2.5">
                {PRO_FEATURES.map((f) => (
                  <li key={f} className="flex items-start gap-2 text-sm">
                    <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <Check className="size-3 text-primary" />
                    </span>
                    <span>{f}</span>
                  </li>
                ))}
              </ul>
              <p className="mt-6 text-xs text-muted-foreground italic">
                Pro সুবিধা plan policy অনুযায়ী উপলব্ধ হবে।
              </p>
            </CardContent>
          </Card>
        </div>
      </SectionWrapper>
  );
}
