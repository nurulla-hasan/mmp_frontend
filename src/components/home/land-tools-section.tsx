"use client";

import { useState } from "react";
import {
  ArrowRight,
  Calculator,
  Compass,
  Map,
  MoveDiagonal,
  Ruler,
  Scale,
  Sparkles,
  RefreshCw,
} from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toBengaliDigits } from "@/lib/utils";

const otherTools = [
  {
    icon: MoveDiagonal,
    title: "একক রূপান্তর",
    description: "শতাংশ, কাঠা, বিঘা, একর ও বর্গফুটের মধ্যে নিখুঁত রূপান্তর।",
    href: "/tools/unit-converter",
    badge: "ফ্রি",
  },
  {
    icon: Calculator,
    title: "উত্তরাধিকার হিসাব",
    description: "ইসলামিক ও আইনানুগ ফারায়েজ অনুযায়ী অংশ বণ্টন গণনা।",
    href: "/tools/inheritance-calculator",
    badge: "ফ্রি",
  },
  {
    icon: Scale,
    title: "মৌজা স্কেল গাইড",
    description: "১৬″ = ১ মাইল, ৩২″ বা ৬৪″ স্কেলের মানচিত্র হিসাব।",
    href: "/tools/scale-guide",
    badge: "ফ্রি",
  },
];

const benefits = [
  "একাধিক দাগ ও প্লট",
  "C.S / B.S স্কেল সাপোর্ট",
  "ক্যালকুলেশন প্রজেক্ট সেভ",
  "PDF ও প্রিন্ট রিপোর্ট",
  "মোবাইল ও পিসিবান্ধব",
];

export function LandToolsSection() {
  const [shotokInput, setShotokInput] = useState<string>("১");

  const numericShotok = parseFloat(
    shotokInput.replace(/[০-৯]/g, (d) => "০১২৩৪৫৬৭৮৯".indexOf(d).toString()),
  ) || 0;

  const sqFeet = numericShotok * 435.6;
  const katha = numericShotok / 1.65;
  const bigha = numericShotok / 33;

  return (
    <div className="relative overflow-hidden bg-background">
      <SectionWrapper id="tools">
        <SectionHeading
          badge="ল্যান্ড টুলস"
          title="জমির প্রয়োজনীয় হিসাব করুন নিমেষেই"
          description="বাংলাদেশে ব্যবহৃত সরকারি ভূমি পরিমাপ ও মানচিত্রের অনুপাত অনুযায়ী তৈরি নির্ভুল ক্যালকুলেটর।"
        />

        <div className="mt-8 grid gap-4.5 sm:grid-cols-2 lg:grid-cols-3">
          {/* Featured Tool Card with Live Interactive Converter */}
          <div className="sm:col-span-2 lg:col-span-3">
            <Card className="border border-primary/20 bg-card transition-all duration-200 hover:border-primary/40 shadow-sm">
              <CardContent className="flex flex-col lg:flex-row items-center justify-between gap-8 p-6 sm:p-8">
                {/* Left side: Tool info */}
                <div className="flex-1 space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="flex size-12 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Ruler className="size-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading text-xl font-bold text-foreground">
                          জমির ক্ষেত্রফল ও বহুভুজ পরিমাপ
                        </h3>
                        <Badge variant="default" className="text-xs gap-1">
                          <Sparkles className="size-3" /> Pro
                        </Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        মৌজা নকশার যেকোনো জটিল প্লটের নিখুঁত পরিমাপ
                      </p>
                    </div>
                  </div>

                  <p className="text-sm leading-relaxed text-muted-foreground max-w-xl">
                    ত্রিভুজ, চতুর্ভুজ বা অনিয়মিত আকারের যেকোনো জমির পরিমাপ করুন।
                    শতক, কাঠা, বিঘা এবং বর্গফুটে একযোগে ফলাফল পান এবং প্রজেক্ট
                    হিসেবে সেভ করুন।
                  </p>

                  <div className="pt-2 flex flex-wrap items-center gap-3">
                    <Button
                      size="default"
                      nativeButton={false}
                      render={<Link href="/tools/land-measurement" />}
                      className="gap-2 shadow-xs"
                    >
                      টুলটি ব্যবহার করুন
                      <ArrowRight className="size-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="default"
                      nativeButton={false}
                      render={<Link href="/tools" />}
                    >
                      সব টুলস দেখুন
                    </Button>
                  </div>
                </div>

                {/* Right side: Live Interactive Micro Calculator */}
                <div className="w-full lg:w-96 rounded-xl border border-border bg-muted/30 p-4 sm:p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-semibold font-heading text-foreground">
                      <RefreshCw className="size-3.5 text-primary" />
                      <span>লাইভ একক হিসাব ডেমো</span>
                    </div>
                    <span className="text-[11px] text-muted-foreground">
                      তাৎক্ষণিক রূপান্তর
                    </span>
                  </div>

                  {/* Input */}
                  <div className="relative">
                    <Input
                      type="text"
                      value={shotokInput}
                      onChange={(e) => setShotokInput(e.target.value)}
                      placeholder="শতক লিখুন"
                      className="pr-14 text-sm font-medium font-mono h-9 bg-card"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs font-semibold text-primary pointer-events-none">
                      শতক
                    </span>
                  </div>

                  {/* Live Results Grid */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="flex flex-col justify-center rounded-lg border border-border bg-card p-2.5 text-center">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {toBengaliDigits(sqFeet.toFixed(1))}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        বর্গফুট
                      </span>
                    </div>
                    <div className="flex flex-col justify-center rounded-lg border border-border bg-card p-2.5 text-center">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {toBengaliDigits(katha.toFixed(2))}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        কাঠা
                      </span>
                    </div>
                    <div className="flex flex-col justify-center rounded-lg border border-border bg-card p-2.5 text-center">
                      <span className="text-xs font-mono font-bold text-foreground">
                        {toBengaliDigits(bigha.toFixed(3))}
                      </span>
                      <span className="text-xs text-muted-foreground mt-0.5">
                        বিঘা
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Other Tools Cards */}
          {otherTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.href}
                href={tool.href}
                className="group block transition-transform duration-200 hover:-translate-y-1 focus:outline-none"
              >
                <Card className="h-full border border-border/80 bg-card transition-all duration-200 group-hover:border-primary/50 group-hover:shadow-sm">
                  <CardContent className="flex items-start gap-4 p-5">
                    <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                      <Icon className="size-5" />
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="font-heading font-semibold text-base text-foreground group-hover:text-primary transition-colors">
                          {tool.title}
                        </h3>
                        <Badge variant="secondary">{tool.badge}</Badge>
                      </div>
                      <p className="text-xs leading-5 text-muted-foreground">
                        {tool.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>

        {/* Benefits Bar */}
        <div className="mt-8 flex flex-wrap items-center justify-between gap-4 rounded-xl border border-border/80 bg-muted/40 p-4 sm:p-5">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
            {benefits.map((b) => (
              <div
                key={b}
                className="flex items-center gap-1.5 text-xs sm:text-sm text-muted-foreground"
              >
                <Map className="size-3.5 text-primary shrink-0" />
                <span>{b}</span>
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            nativeButton={false}
            render={<Link href="/tools" />}
            className="gap-1"
          >
            সব ল্যান্ড টুলস
            <ArrowRight className="size-3.5" />
          </Button>
        </div>
      </SectionWrapper>
    </div>
  );
}
