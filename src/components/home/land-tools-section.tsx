import {
  ArrowRight,
  Calculator,
  Grid3X3,
  Map,
  Monitor,
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
  "একাধিক প্লট সমর্থন",
  "স্কেল সাপোর্ট",
  "হিসাব সংরক্ষণ",
  "পিডিএফ/প্রিন্ট রিপোর্ট",
  "অনলাইন ও অফলাইন-বান্ধব",
];

export function LandToolsSection() {
  return (
    <SectionWrapper id="tools" padding="md">
      <SectionHeading
        badge="Land Tools"
        title="প্লট মাপ ও জমির হিসাব করুন ডিজিটালি"
        description="বাংলাদেশী এককে জমির ক্ষেত্রফল, ভাগ, রূপান্তর ও উত্তরাধিকার ক্যালকুলেশন — সব এক জায়গায়।"
      />
      <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {/* Featured tool card - prominent */}
        <Link
          href="/tools/land-measurement"
          className="group sm:col-span-2 lg:col-span-1"
        >
          <Card className="h-full border-primary/20 transition-all group-hover:border-primary/40 group-hover:shadow-md">
            <CardContent className="flex flex-col p-6">
              <div className="flex size-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Ruler className="size-7" />
              </div>
              <h3 className="mt-5 text-xl font-semibold">জমির ক্ষেত্রফল</h3>
              <p className="mt-1.5 text-sm leading-6 text-muted-foreground">
                যেকোনো আকারের প্লটের সঠিক ক্ষেত্রফল শতাংশ, বিঘা, বর্গফুট ও
                হেক্টরে নির্ধারণ করুন।
              </p>
              <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
                <Monitor className="size-4" />
                Tool ব্যবহার করুন <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" />
              </span>
              {/* Mini plot visual */}
              <div className="mt-6 grid grid-cols-3 gap-1.5">
                <div className="h-7 rounded-md border-2 border-primary/20 bg-primary/5" />
                <div className="h-7 rounded-md border-2 border-primary/30 bg-primary/10" />
                <div className="h-7 rounded-md border-2 border-primary/20 bg-primary/5" />
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
              <Card className="h-full transition-all group-hover:border-primary/30 group-hover:shadow-sm">
                <CardContent className="flex items-start gap-4 p-4 md:p-5">
                  <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Icon className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold">{tool.title}</h3>
                    <p className="mt-0.5 text-sm leading-6 text-muted-foreground">
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
      <div className="mt-10 flex flex-wrap items-center justify-between gap-6 rounded-xl border bg-card p-5 md:p-6">
        <div className="flex flex-wrap gap-x-6 gap-y-2.5">
          {benefits.map((b) => (
            <div key={b} className="flex items-center gap-1.5 text-sm text-muted-foreground">
              <Map className="size-3.5 text-primary" />
              {b}
            </div>
          ))}
        </div>
        <Button variant="outline" className="h-10 md:h-11 px-6" nativeButton={false} render={<Link href="/tools" />}>
          সব Land Tools দেখুন &rarr;
        </Button>
      </div>
    </SectionWrapper>
  );
}
