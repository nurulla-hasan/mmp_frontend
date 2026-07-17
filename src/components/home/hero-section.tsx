"use client";

import { useState } from "react";
import {
  Compass,
  Layers,
  MapPin,
  Ruler,
  Search,
  ShieldCheck,
} from "lucide-react";
import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { SectionWrapper } from "@/components/shared/section-wrapper";
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
    <div className="relative overflow-hidden">
      {/* Ambient Glows */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 h-200 w-200 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-200 w-200 translate-y-1/3 -translate-x-1/3 rounded-full bg-blue-500/10 blur-[100px]" />
      </div>

      <SectionWrapper
        id="hero"
        asSection
        padding="xl"
      >
        <div className="grid gap-10 lg:grid-cols-[1.2fr_0.9fr] lg:items-center">
          {/* Left: Text and CTA */}
          <div>
            <Badge className="bg-primary/10 text-primary p-3 rounded-sm">
              জমির হিসাব নিয়ে আর কোনো দুশ্চিন্তা নয়
            </Badge>
            <h1 className="mt-4 text-3xl font-semibold tracking-tight sm:text-4xl lg:text-5xl leading-[1.2] font-heading">
              জমির সীমানা ও পরিমাপ নিয়ে
              <br />
              <span className="text-primary">থাকুন সম্পূর্ণ নিশ্চিন্ত</span>
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">
              অভিজ্ঞ সার্ভেয়ার খুঁজুন, কাজের অনুরোধ পোস্ট করুন এবং আধুনিক ডিজিটাল টুল দিয়ে জমি পরিমাপ, ম্যাপ তুলনা ও ট্রেস করুন।
            </p>

            {/* Surveyor Search Form */}
            <div className="mt-6 rounded-xl border bg-card p-4">
              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">
                  <label className="mb-1 block text-xs font-medium text-muted-foreground">
                    প্রয়োজনীয় সেবা
                  </label>
                  <Select
                    value={service}
                    onValueChange={(v) => setService(v ?? "")}
                  >
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
                  <Select
                    value={district}
                    onValueChange={(v) => setDistrict(v ?? "")}
                  >
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

            {/* Benefit Items */}
            <div className="mt-8 flex flex-wrap gap-3 sm:grid sm:grid-cols-3 sm:gap-4">
              {[
                { title: "এলাকাভিত্তিক সার্ভেয়ার খুঁজুন", icon: MapPin },
                { title: "একাধিক কোটেশন তুলনা করুন", icon: Layers },
                { title: "নিরাপদে কাজের অনুরোধ পোস্ট করুন", icon: ShieldCheck },
              ].map((item, i) => (
                <div key={i} className="flex items-start sm:items-center gap-2 rounded-lg border bg-card/50 p-2.5 sm:px-3 sm:py-2 text-sm text-muted-foreground shadow-sm">
                  <item.icon className="size-4 text-primary shrink-0 mt-0.5 sm:mt-0" />
                  <span className="leading-snug">{item.title}</span>
                </div>
              ))}
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
                  <pattern
                    id="grid"
                    width="40"
                    height="40"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M 40 0 L 0 0 0 40"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="0.5"
                    />
                  </pattern>
                </defs>
                <rect width="100%" height="100%" fill="url(#grid)" />
                <path
                  d="M 0 250 L 400 250 M 200 0 L 200 500"
                  stroke="currentColor"
                  strokeWidth="0.3"
                  opacity="0.5"
                />
              </svg>
            </div>

            <div className="relative grid gap-4">
              {/* Saved calculation card */}
              <Link href="/tools/land-measurement" className="block group">
                <Card className="rounded-xl ring-1 ring-primary/10 bg-card/60 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1 hover:ring-primary/30 duration-500">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Ruler className="size-3.5" />
                        ডিজিটাল ল্যান্ড মেজারমেন্ট
                      </div>
                      <Badge variant="active" size="sm" className="rounded-md">
                        অ্যাডভান্সড টুল
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      মৌজা ম্যাপ আপলোড করে স্কেল নির্ধারণ, জমির সীমানা আঁকা, ভাগ করা এবং নির্ভুল ক্ষেত্রফল হিসাব করুন।
                    </p>
                    {/* Mini plot visualization */}
                    <div className="mt-3 relative h-24 w-full rounded border border-border/50 bg-muted/20 flex items-center justify-center overflow-hidden">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[8px_8px]" />
                      <svg className="relative w-full h-full" viewBox="0 0 100 60">
                        <path
                          d="M 25 15 L 85 10 L 75 50 L 15 45 Z"
                          fill="var(--color-primary)"
                          fillOpacity="0.1"
                          stroke="var(--color-primary)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <text x="55" y="11" fontSize="4.5" fill="currentColor" className="text-muted-foreground" textAnchor="middle">১২০ ফুট</text>
                        <text x="82" y="32" fontSize="4.5" fill="currentColor" className="text-muted-foreground" textAnchor="middle" transform="rotate(75, 82, 32)">৮০ ফুট</text>
                        <text x="45" y="53" fontSize="4.5" fill="currentColor" className="text-muted-foreground" textAnchor="middle">১১৫ ফুট</text>
                        <text x="18" y="30" fontSize="4.5" fill="currentColor" className="text-muted-foreground" textAnchor="middle" transform="rotate(-70, 18, 30)">৭৫ ফুট</text>

                        <text x="50" y="32" fontSize="6.5" fontWeight="bold" fill="var(--color-primary)" textAnchor="middle">৪২.৭৫</text>
                        <text x="50" y="39" fontSize="4.5" fill="var(--color-primary)" textAnchor="middle">শতাংশ</text>
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Pantagraph Tool Card */}
              <Link href="/tools/pantagraph" className="block group">
                <Card className="rounded-xl ring-1 ring-primary/10 bg-card/60 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1 hover:ring-purple-500/30 duration-500 delay-75">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Layers className="size-3.5" />
                        Digital Pantagraph
                      </div>
                      <Badge variant="admin" size="sm" className="rounded-md">
                        Advanced Tool
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      সাবেক ও হাল ম্যাপের মিলযুক্ত পয়েন্ট নির্বাচন করে দুটি ম্যাপ নির্ভুলভাবে align ও তুলনা করুন।
                    </p>
                    {/* Mini Pantagraph Visualization */}
                    <div className="mt-3 relative h-20 w-full overflow-hidden rounded border border-border/50 bg-muted/20 flex items-center justify-center">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[8px_8px]" />
                      <svg className="relative w-full h-full" viewBox="0 0 100 60">
                        {/* Map 1 (e.g. C.S Map in Red) */}
                        <path
                          d="M 25 20 L 65 15 L 75 45 L 30 50 Z"
                          fill="none"
                          stroke="#ef4444"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                          className="opacity-70"
                        />
                        <text x="50" y="25" fontSize="4.5" fill="#ef4444" opacity="0.8">সি.এস</text>

                        {/* Map 2 (e.g. B.S Map in Blue/Primary) - slightly offset/rotated to show comparison */}
                        <path
                          d="M 28 22 L 68 18 L 72 48 L 32 52 Z"
                          fill="var(--color-primary)"
                          fillOpacity="0.1"
                          stroke="var(--color-primary)"
                          strokeWidth="1.5"
                        />
                        <text x="50" y="45" fontSize="4.5" fill="var(--color-primary)">বি.এস</text>

                        {/* Alignment crosshairs/match points */}
                        <circle cx="28" cy="22" r="1.5" fill="var(--color-primary)" />
                        <circle cx="68" cy="18" r="1.5" fill="var(--color-primary)" />

                        {/* Connection lines showing alignment matching */}
                        <path d="M 25 20 L 28 22" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                        <path d="M 65 15 L 68 18" stroke="currentColor" strokeWidth="0.5" className="text-muted-foreground" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              {/* Map Tracer Tool Card */}
              <Link href="/tools/tracer" className="block group">
                <Card className="rounded-xl ring-1 ring-primary/10 bg-card/60 backdrop-blur-xl shadow-2xl transition-all hover:-translate-y-1 hover:ring-blue-500/30 duration-500 delay-150">
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5 text-xs font-medium text-primary">
                        <Compass className="size-3.5" />
                        Digital Map Tracer
                      </div>
                      <Badge variant="processing" size="sm" className="rounded-md">
                        Advanced Tool
                      </Badge>
                    </div>
                    <p className="mt-2 text-xs text-muted-foreground">
                      পুরোনো মৌজা ম্যাপের C.S, S.A ও B.S দাগ আলাদা layer-এ trace করে পরিষ্কার ডিজিটাল ম্যাপ তৈরি করুন।
                    </p>
                    {/* Mini Tracer Visualization */}
                    <div className="mt-3 relative h-16 w-full overflow-hidden rounded border border-border/50 bg-muted/20">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[8px_8px]" />
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 60">
                        <path
                          d="M 20 15 L 60 10 L 80 40 L 35 50 Z"
                          fill="var(--color-primary)"
                          fillOpacity="0.15"
                          stroke="var(--color-primary)"
                          strokeWidth="1.5"
                          strokeLinejoin="round"
                        />
                        <circle cx="20" cy="15" r="2" fill="var(--color-primary)" />
                        <circle cx="60" cy="10" r="2" fill="var(--color-primary)" />
                        <circle cx="80" cy="40" r="2" fill="var(--color-primary)" />
                        <circle cx="35" cy="50" r="2" fill="var(--color-primary)" />
                        <path
                          d="M 35 50 L 15 40"
                          stroke="var(--color-primary)"
                          strokeWidth="1"
                          strokeDasharray="2 2"
                        />
                        <circle cx="15" cy="40" r="1.5" fill="none" stroke="var(--color-primary)" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          </div>
        </div>
      </SectionWrapper>
    </div>
  );
}
