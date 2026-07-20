import { Check, Lock, Star } from "lucide-react";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/ui/custom/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { FREE_TOOLS } from "./pricing-data";

const FREE_FEATURES = [
  "জমির একক রূপান্তর — শতক, কাঠা, বিঘা, একর, বর্গফুট",
  "জমি বণ্টন ক্যালকুলেটর — অংশীদারদের জমি ভাগ করুন",
  "সার্ভেয়ার লিস্টিং ও পাবলিক প্রোফাইল দেখা",
  "সার্ভিস রিকোয়েস্ট তৈরি করা",
  "সার্ভেয়ারদের পার-সার্ভিস প্রাইসিং দেখা",
  "বেসিক অ্যাকাউন্ট অ্যাক্সেস",
];

const PRO_FEATURES = [
  "সব ফ্রি টুল + ৫টি অ্যাডভান্সড টুল",
  "ম্যাপ আপলোড করে প্লট আঁকা ও ক্ষেত্রফল",
  "প্যান্টাগ্রাফ দিয়ে ম্যাপ এলাইন ও তুলনা",
  "ডিজিটাল ট্রেসিং — CS/BS দাগ ট্রেস",
  "মৌজা ম্যাপ স্টুডিও — CS-BS align",
  "মৌজা জিও স্টুডিও — KMZ ও Google Earth",
  "প্রকল্প সেভ, PDF/Print/PNG এক্সপোর্ট",
];

export function FreeVsPro() {
  return (
    <SectionWrapper id="free-vs-pro" asSection>
      <SectionHeading
        badge="অ্যাক্সেস স্তর"
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
            <h3 className="text-lg font-semibold font-heading">ফ্রি অ্যাক্সেস</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Platform ও basic land-service workflow পরিচিত হওয়ার জন্য।
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold tracking-tight md:text-5xl font-heading">
                ৳০
              </span>
              <span className="ml-1 text-sm text-muted-foreground">সর্বদা</span>
            </div>
            {/* Free tools */}
            <div className="mt-4 mb-2 rounded-lg bg-primary/5 p-2.5">
              <p className="text-xs font-medium text-primary mb-1.5">ফ্রি টুল:</p>
              <div className="flex flex-wrap gap-2">
                {FREE_TOOLS.map((tool) => (
                  <span key={tool} className="inline-flex items-center gap-1 rounded-md bg-background px-2 py-0.5 text-xs font-medium text-foreground/80 ring-1 ring-primary/10">
                    <Check className="size-3 text-primary" />
                    {tool}
                  </span>
                ))}
              </div>
            </div>
            <ul className="flex-1 space-y-3">
              {FREE_FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-muted-foreground/50" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <p className="mt-6 text-xs leading-5 text-muted-foreground italic">
              Free টুলস ও সুবিধা সবার জন্য উন্মুক্ত।
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
            <h3 className="text-lg font-semibold font-heading">প্রো অ্যাক্সেস</h3>
            <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
              Advanced calculation workspace, map tracing ও professional report-এর জন্য।
            </p>
            <div className="mt-4">
              <span className="text-4xl font-bold tracking-tight md:text-5xl font-heading">
                ৳২৯৯
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
              প্ল্যান অনুযায়ী নির্দিষ্ট টুল ও সুবিধা উপলব্ধ।
            </p>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
