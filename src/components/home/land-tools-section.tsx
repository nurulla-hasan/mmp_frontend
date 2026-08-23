import {
  ArrowRight,
  Calculator,
  Map,
  MoveDiagonal,
  Ruler,
  Scale,
  Sparkles,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const tools = [
  {
    icon: Ruler,
    title: "জমির ক্ষেত্রফল",
    description: "বাংলাদেশীয় এককে জমির মাপ ও ক্ষেত্রফল গণনা করুন।",
    href: "/tools/land-measurement",
    badge: { label: "Pro", variant: "default" as const },
  },
  {
    icon: MoveDiagonal,
    title: "একক রূপান্তর",
    description: "বিভিন্ন জমির এককের মধ্যে রূপান্তর করুন।",
    href: "/tools/unit-converter",
    badge: { label: "ফ্রি", variant: "secondary" as const },
  },
  {
    icon: Calculator,
    title: "উত্তরাধিকার হিসাব",
    description: "ভাগ সম্পত্তির হিসাব ও বন্টন নির্ধারণ করুন।",
    href: "/tools/inheritance-calculator",
    badge: { label: "ফ্রি", variant: "secondary" as const },
  },
  {
    icon: Scale,
    title: "স্কেল গাইড",
    description: "মানচিত্রের স্কেল ও দূরত্ব নির্ধারণে সহায়তা।",
    href: "/tools/scale-guide",
    badge: { label: "ফ্রি", variant: "secondary" as const },
  },
];

const benefits = [
  "একাধিক প্লট",
  "স্কেল সাপোর্ট",
  "ক্যালকুলেশন সেভ",
  "PDF/Print রিপোর্ট",
  "অনলাইন ও অফলাইন-বান্ধব",
];

export function LandToolsSection() {
  return (
    <div className="relative overflow-hidden bg-background">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-1/2 left-1/4 h-125 w-125 -translate-y-1/2 -translate-x-1/2 rounded-full bg-primary/15 blur-[100px]" />
        <div className="absolute top-1/2 right-1/4 h-125 w-125 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/10 blur-[100px]" />
      </div>

      <SectionWrapper id="tools">
        <SectionHeading
          badge="ল্যান্ড টুলস"
          title="জমির প্রয়োজনীয় হিসাব করুন সহজে"
          description="বাংলাদেশে ব্যবহৃত জমির একক ও পরিমাপ অনুযায়ী তৈরি দরকারি tools ব্যবহার করুন।"
        />
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured tool card - Banner */}
          <Link
            href="/tools/land-measurement"
            className="group sm:col-span-2 lg:col-span-3"
          >
            <Card className="h-full border-primary/10 bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:ring-1 hover:ring-primary/30">
              <CardContent className="flex flex-col md:flex-row items-center justify-between gap-8">
                <div className="flex-1">
                  <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                    <Ruler className="size-6" />
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <h3 className="text-xl font-semibold">জমির ক্ষেত্রফল</h3>
                    <Badge variant="default" className="text-[10px] gap-1">
                      <Sparkles className="size-3" /> Pro
                    </Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground max-w-md">
                    যেকোনো আকারের প্লটের সঠিক ক্ষেত্রফল শতাংশ, বিঘা ও বর্গফুটে
                    নির্ধারণ করুন।
                  </p>
                  <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                    Tool ব্যবহার করুন <ArrowRight className="size-4" />
                  </span>
                </div>

                {/* Mini visual */}
                <div className="w-full md:w-1/3 grid grid-cols-3 gap-2">
                  <div className="flex flex-col justify-end p-2.5 rounded-lg border border-primary/20 bg-primary/5 h-20 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                    <span className="text-[10px] font-mono font-medium text-primary">১ শতক</span>
                    <span className="text-[9px] text-muted-foreground">৪৩৫.৬ ব.ফুট</span>
                  </div>
                  <div className="flex flex-col justify-end p-2.5 rounded-lg border border-primary/30 bg-primary/10 h-24 transition-all duration-300 group-hover:border-primary/50 group-hover:bg-primary/15">
                    <span className="text-[10px] font-mono font-bold text-primary">১ কাঠা</span>
                    <span className="text-[9px] text-muted-foreground">৭২০ ব.ফুট</span>
                  </div>
                  <div className="flex flex-col justify-end p-2.5 rounded-lg border border-primary/20 bg-primary/5 h-16 transition-all duration-300 group-hover:border-primary/40 group-hover:bg-primary/10">
                    <span className="text-[10px] font-mono font-medium text-primary">১ বিঘা</span>
                    <span className="text-[9px] text-muted-foreground">২০ কাঠা</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
          {tools.slice(1).map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group">
                <Card className="h-full border-primary/10 bg-card/60 transition-all duration-500 hover:-translate-y-1 hover:shadow-2xl hover:ring-1 hover:ring-primary/30">
                  <CardContent className="flex items-start gap-4">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-medium">{tool.title}</h3>
                        {tool.badge && (
                          <Badge
                            variant={tool.badge.variant}
                            className="text-[10px] px-1.5 py-0.5 leading-none"
                          >
                            {tool.badge.label}
                          </Badge>
                        )}
                      </div>
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
        <div className="mt-8 flex flex-wrap items-center justify-between gap-6 rounded-xl border border-primary/10 bg-card/60 p-5 shadow-lg transition-all duration-500 hover:shadow-xl">
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            {benefits.map((b) => (
              <div
                key={b}
                className="flex items-center gap-1.5 text-sm text-muted-foreground"
              >
                <Map className="size-3.5 text-primary" />
                {b}
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            nativeButton={false}
            render={<Link href="/tools" />}
          >
            সব Land Tools দেখুন &rarr;
          </Button>
        </div>
      </SectionWrapper>
    </div>
  );
}
