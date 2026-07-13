import {
  ArrowRight,
  Calculator,
  Grid3X3,
  Map,
  MoveDiagonal,
  Ruler,
  Scale,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const tools = [
  {
    icon: Ruler,
    title: "জমির ক্ষেত্রফল",
    description: "বাংলাদেশীয় এককে জমির মাপ ও ক্ষেত্রফল গণনা করুন।",
    href: "/tools/land-measurement",
  },
  {
    icon: Grid3X3,
    title: "জমি ভাগ",
    description: "জমি সমান বা নির্দিষ্ট অনুপাতে ভাগ করুন।",
    href: "/tools/land-division",
  },
  {
    icon: MoveDiagonal,
    title: "একক রূপান্তর",
    description: "বিভিন্ন জমির এককের মধ্যে রূপান্তর করুন।",
    href: "/tools/unit-converter",
  },
  {
    icon: SlidersHorizontal,
    title: "ক্ষেত্রফল রূপান্তর",
    description: "বিভিন্ন ক্ষেত্রফল এককে মান পরিবর্তন করুন।",
    href: "/tools/area-converter",
  },
  {
    icon: Calculator,
    title: "উত্তরাধিকার হিসাব",
    description: "ভাগ সম্পত্তির হিসাব ও বন্টন নির্ধারণ করুন।",
    href: "/tools/inheritance-calculator",
  },
  {
    icon: Scale,
    title: "স্কেল গাইড",
    description: "মানচিত্রের স্কেল ও দূরত্ব নির্ধারণে সহায়তা।",
    href: "/tools",
  },
];

const benefits = [
  "Multiple plots",
  "Scale support",
  "Calculation save",
  "PDF/Print report",
  "Online & offline-friendly",
];

export function LandToolsSection() {
  return (
    <SectionWrapper id="tools" padding="md">
      <SectionHeading
        badge="Land Tools"
        title="জমির প্রয়োজনীয় হিসাব করুন সহজে"
        description="বাংলাদেশে ব্যবহৃত জমির একক ও পরিমাপ অনুযায়ী তৈরি দরকারি tools ব্যবহার করুন।"
      />
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {/* Featured tool card - larger */}
        <Link
          href="/tools/land-measurement"
          className="group sm:col-span-2 lg:col-span-1"
        >
          <Card className="h-full transition-all group-hover:ring-primary/30 group-hover:shadow-sm">
            <CardContent className="p-5">
              <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Ruler className="size-6" />
              </div>
              <h3 className="mt-4 text-lg font-medium">জমির ক্ষেত্রফল</h3>
              <p className="mt-1 text-sm leading-6 text-muted-foreground">
                যেকোনো আকারের প্লটের সঠিক ক্ষেত্রফল শতাংশ, বিঘা ও বর্গফুটে
                নির্ধারণ করুন।
              </p>
              <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                Tool ব্যবহার করুন <ArrowRight className="size-4" />
              </span>
              {/* Mini visual */}
              <div className="mt-4 grid grid-cols-3 gap-1">
                <div className="h-6 rounded border-2 border-primary/20 bg-primary/5" />
                <div className="h-6 rounded border-2 border-primary/30 bg-primary/10" />
                <div className="h-6 rounded border-2 border-primary/20 bg-primary/5" />
              </div>
            </CardContent>
          </Card>
        </Link>
        {tools.slice(1).map((tool) => {
          const Icon = tool.icon;
          return (
            <Link
              key={tool.href}
              href={tool.href}
              className="group transition-all hover:-translate-y-0.5"
            >
              <Card className="h-full transition-all group-hover:ring-primary/30 group-hover:shadow-sm">
                <CardContent className="flex items-start gap-4 p-4">
                  <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">{tool.title}</h3>
                    <p className="mt-0.5 text-sm text-muted-foreground">
                      {tool.description}
                    </p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
      {/* Benefits + CTA */}
      <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-xl border bg-card p-5">
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Map className="size-3.5 text-primary" />
              {b}
            </div>
          ))}
        </div>
        <Button variant="outline" nativeButton={false} render={<Link href="/tools" />}>
          সব Land Tools দেখুন &rarr;
        </Button>
      </div>
    </SectionWrapper>
  );
}
