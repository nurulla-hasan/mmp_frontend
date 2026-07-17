import { Scale, Map, Ruler, CheckCircle2, AlertTriangle, ArrowRight } from "lucide-react";
import Link from "next/link";

import { PageWrapper } from "@/components/shared/page-wrapper";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "Scale Guide | Mouza Map Pro",
  description: "কীভাবে নির্ভুল জমি পরিমাপের জন্য ম্যাপ স্কেল সেট করতে হয় তা শিখুন।",
};

const steps = [
  {
    number: 1,
    title: "পরিচিত দূরত্ব নির্বাচন করুন",
    description: "ম্যাপে এমন একটি লাইন নির্বাচন করুন যার বাস্তব দৈর্ঘ্য আপনি জানেন।",
    icon: Map,
  },
  {
    number: 2,
    title: "বাস্তব মাপ লিখুন",
    description: "নির্বাচিত লাইনের আসল মাপ ফুট অনুযায়ী লিখুন।",
    icon: Ruler,
  },
  {
    number: 3,
    title: "অ্যাপ স্কেল হিসাব করবে",
    description: "Mouza Map Pro অটোমেটিকভাবে pixel-to-feet স্কেল সেট করবে।",
    icon: Scale,
  },
  {
    number: 4,
    title: "এরপর প্লট আঁকুন",
    description: "স্কেল সেট হওয়ার পর প্লট আঁকলে জমির পরিমাণ ও সীমানার সঠিক হিসাব দেখা যাবে।",
    icon: CheckCircle2,
  },
];

export default function ScaleGuidePage() {
  return (
    <PageWrapper paddingSize="none" className="overflow-hidden">
      {/* ─── Hero ──────────────────────────────────────────── */}
      <SectionWrapper padding="lg">
        <div className="relative mx-auto max-w-3xl text-center">
          {/* Background glow */}
          <div className="pointer-events-none absolute top-0 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 -translate-y-20 rounded-full bg-primary/10 blur-[100px]" />
          
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10">
            <Scale className="size-8 text-primary" />
          </div>
          
          <h1 className="mt-6 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl font-heading">
            স্কেল ঠিক করুন, হিসাব নির্ভুল করুন
          </h1>
          <p className="mt-4 text-lg leading-7 text-muted-foreground">
            ম্যাপের স্কেল ঠিক তো জমির হিসাব ১০০% ঠিক। পরিচিত একটি দূরত্ব মেপে স্কেল সেট করুন, বাকি হিসাব Mouza Map Pro অটোমেটিক বের করে দেবে।
          </p>
        </div>
      </SectionWrapper>
      <div className="mx-auto mt-8 max-w-4xl space-y-10">
          {/* Steps Grid */}
          <div className="grid gap-6 sm:grid-cols-2">
            {steps.map((step) => {
              const Icon = step.icon;
              return (
                <Card
                  key={step.number}
                  className="relative overflow-hidden border-primary/10 bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:shadow-primary/10 hover:ring-2 hover:ring-primary/20"
                >
                  <div className="absolute -top-4 -right-4 p-4 opacity-5">
                    <span className="text-9xl font-bold font-heading">{step.number}</span>
                  </div>
                  <CardContent>
                    <div className="flex size-12 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <h3 className="mt-4 text-lg font-semibold">
                      <span className="mr-2 text-primary">{step.number}.</span>
                      {step.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {step.description}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Warning Alert */}
          <div className="flex gap-4 rounded-xl border border-amber-200 bg-amber-50 p-6 text-amber-900 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
            <AlertTriangle className="size-6 shrink-0 text-amber-600 dark:text-amber-500" />
            <div>
              <h4 className="font-semibold text-amber-800 dark:text-amber-400">গুরুত্বপূর্ণ সতর্কতা</h4>
              <p className="mt-1 text-sm leading-relaxed">
                স্কেল ভুল হলে জমির হিসাবেও ভুল আসতে পারে। তাই পরিচিত ও নিশ্চিত দূরত্ব
                ব্যবহার করে তবেই স্কেল সেট করুন।
              </p>
            </div>
          </div>

          {/* CTA */}
          <div className="mt-12 text-center">
            <Button size="lg" className="px-8 shadow-md shadow-primary/20 transition-all hover:shadow-lg hover:shadow-primary/30" nativeButton={false} render={<Link href="/map-tool" />}>
              ম্যাপ টুলে ফিরে যান <ArrowRight className="ml-2 size-4" />
            </Button>
          </div>
        </div>
    </PageWrapper>
  );
}
