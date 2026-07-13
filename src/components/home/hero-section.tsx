"use client";

import { useState } from "react";
import {
  BadgeCheck,
  Compass,
  FileText,
  MapPin,
  Ruler,
  Search,
  Star,
} from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const serviceOptions = [
  "জমি পরিমাপ",
  "জমি ভাগ",
  "সীমানা নির্ধারণ",
  "ডিজিটাল সার্ভে",
  "মৌজা ম্যাপ সহায়তা",
];

export function HeroSection() {
  const [service, setService] = useState("");
  const [district, setDistrict] = useState("");

  return (
    <section id="hero" className="border-b">
      <div className="mx-auto w-full max-w-7xl px-4 py-12 sm:px-6 sm:py-16 lg:py-20">
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          {/* Left: Text and CTA */}
          <div>
            <span className="inline-block rounded-full border bg-muted px-3 py-1 text-xs font-medium text-primary">
              জমির হিসাব, সার্ভেয়ার ও সেবা—এক প্ল্যাটফর্মে
            </span>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl leading-[1.2]">
              জমির হিসাব থেকে{" "}
              <span className="text-primary">বিশ্বস্ত সার্ভেয়ার</span>
              <br />
              <span className="text-primary">সব এক জায়গায়</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              জমি মাপুন, হিসাব সংরক্ষণ করুন, যাচাইকৃত আমিন/সার্ভেয়ার খুঁজুন,
              কাজের অনুরোধ পোস্ট করুন এবং একাধিক quotation তুলনা করে সঠিক
              পেশাজীবী নির্বাচন করুন।
            </p>

            {/* Surveyor Search Form */}
            <div className="mt-6 rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    প্রয়োজনীয় সেবা
                  </label>
                  <Select value={service} onValueChange={(v) => setService(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <Search className="size-4 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="সেবা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      {serviceOptions.map((opt) => (
                        <SelectItem key={opt} value={opt}>
                          {opt}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    জেলা নির্বাচন
                  </label>
                  <Select value={district} onValueChange={(v) => setDistrict(v ?? "")}>
                    <SelectTrigger className="w-full">
                      <MapPin className="size-4 shrink-0 text-muted-foreground" />
                      <SelectValue placeholder="জেলা নির্বাচন করুন" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dinajpur">দিনাজপুর</SelectItem>
                      <SelectItem value="rangpur">রংপুর</SelectItem>
                      <SelectItem value="bogura">বগুড়া</SelectItem>
                      <SelectItem value="rajshahi">রাজশাহী</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-end">
                  <Button
                    className="w-full sm:w-auto"
                    nativeButton={false}
                    render={<Link href="/surveyors" />}
                  >
                    <Search className="size-4" />
                    খুঁজুন
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gap-2"
                nativeButton={false}
                render={<Link href="/surveyors" />}
              >
                <Compass className="size-4" />
                সার্ভেয়ার খুঁজুন
              </Button>
              <Button
                size="lg"
                variant="outline"
                nativeButton={false}
                render={<Link href="/tools" />}
              >
                <Ruler className="size-4" />
                জমির টুল ব্যবহার করুন
              </Button>
            </div>
            <div className="mt-3">
              <Link
                href="/join-as-surveyor"
                className="text-sm text-muted-foreground underline-offset-2 hover:text-primary hover:underline"
              >
                সার্ভেয়ার হিসেবে যোগ দিন &rarr;
              </Link>
            </div>
          </div>

          {/* Right: Product ecosystem preview */}
          <div className="relative">
            {/* Decorative grid lines */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden rounded-2xl opacity-[0.04] dark:opacity-[0.08]">
              <svg className="h-full w-full" viewBox="0 0 400 500">
                <defs>
                  <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                    <path d="M 40 0 L 0 0 0 40" fill="none" stroke="currentColor" strokeWidth="0.5" />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path d="M 0 250 L 400 250 M 200 0 L 200 500" stroke="currentColor" strokeWidth="0.3" opacity="0.5" />
              </svg>
            </div>

            <div className="relative grid gap-3">
              {/* Saved calculation card */}
              <Card className="rounded-xl ring-1 ring-primary/10">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-primary">Calculation Project</span>
                    <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-medium text-primary">সংরক্ষিত</span>
                  </div>
                  <p className="mt-2 text-sm font-medium">দিনাজপুর সদর জমি</p>
                  <div className="mt-2 flex items-center gap-3 text-xs text-muted-foreground">
                    <span>৩টি প্লট</span>
                    <span className="h-3 w-px bg-border" />
                    <span>মোট ৪২.৭৫ শতাংশ</span>
                  </div>
                  {/* Mini plot visualization */}
                  <div className="mt-3 flex items-end gap-1">
                    <div className="flex h-10 w-full flex-col items-center justify-end rounded border-2 border-primary/20 bg-primary/5 pb-1">
                      <span className="text-[8px] font-medium text-primary/60">প্লট ১</span>
                      <div className="mt-0.5 h-5 w-[70%] rounded border border-primary/15 bg-primary/10" />
                    </div>
                    <div className="flex h-12 w-full flex-col items-center justify-end rounded border-2 border-primary/30 bg-primary/10 pb-1">
                      <span className="text-[8px] font-medium text-primary/70">প্লট ২</span>
                      <div className="mt-0.5 h-7 w-[85%] rounded border border-primary/20 bg-primary/15" />
                    </div>
                    <div className="flex h-9 w-full flex-col items-center justify-end rounded border-2 border-primary/20 bg-primary/5 pb-1">
                      <span className="text-[8px] font-medium text-primary/60">প্লট ৩</span>
                      <div className="mt-0.5 h-4 w-[60%] rounded border border-primary/15 bg-primary/10" />
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Two cards side by side */}
              <div className="grid grid-cols-2 gap-3">
                {/* Verified surveyor card */}
                <Card className="rounded-xl ring-1 ring-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-2">
                      <div className="flex size-8 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">
                        আ
                      </div>
                      <div>
                        <div className="flex items-center gap-1">
                          <p className="text-xs font-medium">মো. মোশাররফ হোসেন</p>
                          <BadgeCheck className="size-3 text-primary" />
                        </div>
                        <div className="flex items-center gap-1 text-[10px] text-muted-foreground">
                          <Star className="size-3 fill-yellow-500 text-yellow-500" />
                          <span>৪.৮</span>
                        </div>
                      </div>
                    </div>
                    <div className="mt-2 flex flex-wrap gap-1">
                      <span className="rounded-md bg-primary/5 px-1.5 py-0.5 text-[10px] text-primary">Verified</span>
                      <span className="rounded-md bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground">৮ বছর</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Quotation card */}
                <Card className="rounded-xl ring-1 ring-primary/10">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-1 text-xs font-medium text-primary">
                      <FileText className="size-3.5" />
                      Quotation Received
                    </div>
                    <p className="mt-1 text-lg font-bold">৳৩,৫০০</p>
                    <p className="text-[10px] text-muted-foreground">জমি পরিমাপ — দিনাজপুর</p>
                  </CardContent>
                </Card>
              </div>

              {/* Status badge */}
              <div className="flex items-center gap-3 rounded-xl border bg-card px-4 py-3">
                <div className="flex size-8 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-900/30 dark:text-amber-400">
                  <svg className="size-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium">Request Status</p>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-medium text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400">
                      Survey Scheduled
                    </span>
                  </div>
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    সীমানা নির্ধারণ — ১৫ জুলাই, ২০২৬
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
