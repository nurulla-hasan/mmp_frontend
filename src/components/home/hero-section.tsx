import { Compass, Layers, MapPin, Ruler } from "lucide-react";
import Link from "next/link";

import { SectionWrapper } from "@/components/common/section-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const heroBenefits = [
  { title: "এলাকাভিত্তিক সার্ভেয়ার", icon: MapPin },
  { title: "ডিজিটাল ল্যান্ড টুলস", icon: Layers },
  { title: "ম্যাপ ট্রেস ও তুলনা", icon: Compass },
];

export function HeroSection() {
  return (
    <div className="relative overflow-hidden">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute top-0 right-1/4 h-200 w-200 -translate-y-1/2 translate-x-1/2 rounded-full bg-primary/20 blur-[120px]" />
        <div className="absolute bottom-0 left-0 h-200 w-200 translate-y-1/3 -translate-x-1/3 rounded-full bg-yellow-500/10 blur-[100px]" />
      </div>

      <SectionWrapper id="hero" asSection padding="xl">
        <div className="grid gap-12 lg:grid-cols-[1.05fr_1fr] lg:items-center xl:gap-16">
          <div>
            <Badge className="bg-primary/10 p-3 text-primary">
              জমির হিসাব নিয়ে আর কোনো দুশ্চিন্তা নয়
            </Badge>

            <h1 className="mt-5 font-heading text-3xl leading-[1.2] font-semibold tracking-tight sm:text-4xl lg:text-5xl xl:text-[3.45rem]">
              জমির সীমানা ও পরিমাপ নিয়ে
              <br />
              <span className="text-primary">থাকুন সম্পূর্ণ নিশ্চিন্ত</span>
            </h1>

            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg">
              অভিজ্ঞ সার্ভেয়ার খুঁজুন এবং আধুনিক ডিজিটাল টুল দিয়ে জমি
              পরিমাপ, ম্যাপ তুলনা ও ট্রেস করুন।
            </p>

            <div className="mt-7 flex flex-wrap items-center gap-3">
              <Button
                size="lg"
                className="gap-2"
                nativeButton={false}
                render={<Link href="/surveyors" />}
              >
                <MapPin className="size-4" />
                সার্ভেয়ার খুঁজুন
              </Button>

              <Button
                size="lg"
                variant="outline"
                className="gap-2"
                nativeButton={false}
                render={<Link href="/tools" />}
              >
                <Ruler className="size-4" />
                জমির টুল ব্যবহার করুন
              </Button>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              {heroBenefits.map((item) => (
                <div
                  key={item.title}
                  className="flex items-center gap-2 rounded-lg border bg-card/60 px-3 py-2 text-sm text-muted-foreground shadow-sm backdrop-blur-sm"
                >
                  <item.icon className="size-4 shrink-0 text-primary" />
                  <span>{item.title}</span>
                </div>
              ))}
            </div>

            <div className="mt-4">
              <Link
                href="/join-as-surveyor"
                className="text-sm text-muted-foreground underline-offset-4 transition-colors hover:text-primary hover:underline"
              >
                সার্ভেয়ার হিসেবে যোগ দিন &rarr;
              </Link>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-2xl lg:pr-20 xl:pr-28">
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-full bg-primary/10 blur-3xl" />

            <Link href="/tools/land-measurement" className="group block">
              <Card className="overflow-hidden rounded-2xl border-border/70 bg-card/80 shadow-2xl ring-1 ring-primary/10 backdrop-blur-xl transition-all duration-500 group-hover:-translate-y-1 group-hover:ring-primary/25">
                <CardContent className="p-0">
                  <div className="flex items-center justify-between border-b bg-background/65 px-4 py-3">
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="flex size-7 items-center justify-center rounded-md bg-primary text-primary-foreground shadow-sm">
                        <Ruler className="size-4" />
                      </span>
                      জমি পরিমাপ টুল
                    </div>

                    <div className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
                      <span className="rounded-md border bg-background px-2 py-1">↶</span>
                      <span className="rounded-md border bg-background px-2 py-1">↷</span>
                      <span className="rounded-md border bg-background px-2 py-1">ক্লিয়ার</span>
                    </div>
                  </div>

                  <div className="grid min-h-80 grid-cols-[92px_1fr] sm:grid-cols-[112px_1fr]">
                    <div className="border-r bg-muted/20 p-2.5 sm:p-3">
                      <div className="rounded-md bg-primary px-2 py-2 text-[10px] font-medium text-primary-foreground shadow-sm sm:text-xs">
                        <div className="flex items-center gap-1.5">
                          <Ruler className="size-3.5" />
                          পরিমাপ
                        </div>
                      </div>

                      <div className="mt-2 space-y-1 text-[10px] text-muted-foreground sm:text-xs">
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-2">
                          <span className="text-base leading-none">+</span>
                          বিন্দু যোগ
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-2">
                          <Ruler className="size-3.5" />
                          দূরত্ব
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-2">
                          <Layers className="size-3.5" />
                          এলাকা
                        </div>
                        <div className="flex items-center gap-1.5 rounded-md px-2 py-2">
                          <Compass className="size-3.5" />
                          মুভ
                        </div>
                      </div>
                    </div>

                    <div className="relative min-h-80 overflow-hidden bg-muted/10">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-size-[28px_28px]" />

                      <svg
                        className="absolute inset-0 h-full w-full"
                        viewBox="0 0 360 320"
                        aria-hidden="true"
                      >
                        <g
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="0.7"
                          className="text-muted-foreground/20"
                        >
                          <path d="M 0 42 L 92 28 L 162 50 L 241 22 L 360 48" />
                          <path d="M 0 114 L 72 102 L 136 119 L 228 98 L 360 121" />
                          <path d="M 0 205 L 87 184 L 151 214 L 245 187 L 360 210" />
                          <path d="M 58 0 L 69 320" />
                          <path d="M 148 0 L 134 320" />
                          <path d="M 252 0 L 269 320" />
                        </g>

                        <path
                          d="M 91 83 L 271 66 L 290 230 L 207 259 L 77 242 Z"
                          fill="var(--color-primary)"
                          fillOpacity="0.1"
                          stroke="var(--color-primary)"
                          strokeWidth="2.3"
                          strokeLinejoin="round"
                        />

                        {[
                          [91, 83],
                          [271, 66],
                          [290, 230],
                          [207, 259],
                          [77, 242],
                        ].map(([cx, cy]) => (
                          <circle
                            key={`${cx}-${cy}`}
                            cx={cx}
                            cy={cy}
                            r="4.5"
                            fill="var(--color-background)"
                            stroke="var(--color-primary)"
                            strokeWidth="2"
                          />
                        ))}

                        <g
                          fill="currentColor"
                          className="text-muted-foreground"
                          fontSize="10"
                        >
                          <text x="178" y="67" textAnchor="middle">
                            ১২০ ফুট
                          </text>
                          <text x="297" y="151" textAnchor="start">
                            ৮০ ফুট
                          </text>
                          <text x="143" y="270" textAnchor="middle">
                            ১১৫ ফুট
                          </text>
                          <text x="59" y="166" textAnchor="middle">
                            ৭৫ ফুট
                          </text>
                        </g>

                        <text
                          x="184"
                          y="151"
                          textAnchor="middle"
                          fill="currentColor"
                          className="text-foreground"
                          fontSize="11"
                          fontWeight="600"
                        >
                          মোট এলাকা
                        </text>
                        <text
                          x="184"
                          y="181"
                          textAnchor="middle"
                          fill="var(--color-primary)"
                          fontSize="27"
                          fontWeight="700"
                        >
                          ৪২.৭৫
                        </text>
                        <text
                          x="184"
                          y="199"
                          textAnchor="middle"
                          fill="var(--color-primary)"
                          fontSize="12"
                          fontWeight="600"
                        >
                          শতাংশ
                        </text>
                      </svg>

                      <div className="absolute right-3 bottom-3 grid overflow-hidden rounded-lg border bg-background/90 shadow-sm">
                        <span className="px-2.5 py-1 text-sm">+</span>
                        <span className="border-t px-2.5 py-1 text-sm">−</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <div className="mt-4 grid grid-cols-2 gap-3 lg:mt-0 lg:block">
              <Link
                href="/tools/pantagraph"
                className="lg:absolute lg:top-8 lg:right-0 lg:w-36 xl:w-40"
              >
                <Card className="h-full rounded-xl border-border/70 bg-card/90 shadow-xl ring-1 ring-primary/10 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <Layers className="size-3.5 text-primary" />
                      Digital Pantagraph
                    </div>
                    <div className="relative mt-3 h-24 overflow-hidden rounded-lg border bg-muted/15">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-size-[12px_12px]" />
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 70" aria-hidden="true">
                        <path d="M 15 18 L 59 12 L 75 48 L 29 57 Z" fill="none" stroke="var(--color-primary)" strokeWidth="1.8" />
                        <path d="M 24 13 L 70 23 L 63 58 L 18 45 Z" fill="none" stroke="currentColor" strokeWidth="1.3" strokeDasharray="3 2" className="text-muted-foreground" />
                        <circle cx="24" cy="13" r="2" fill="var(--color-primary)" />
                        <circle cx="70" cy="23" r="2" fill="var(--color-primary)" />
                      </svg>
                    </div>
                  </CardContent>
                </Card>
              </Link>

              <Link
                href="/tools/tracer"
                className="lg:absolute lg:right-1 lg:bottom-8 lg:w-36 xl:w-40"
              >
                <Card className="h-full rounded-xl border-border/70 bg-card/90 shadow-xl ring-1 ring-primary/10 backdrop-blur-xl transition-transform duration-300 hover:-translate-y-1">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-1.5 text-[11px] font-semibold">
                      <Compass className="size-3.5 text-primary" />
                      Digital Map Tracer
                    </div>
                    <div className="relative mt-3 h-24 overflow-hidden rounded-lg border bg-muted/15">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-size-[12px_12px]" />
                      <svg className="absolute inset-0 h-full w-full" viewBox="0 0 100 70" aria-hidden="true">
                        <path d="M 17 45 L 49 17 L 82 31 L 65 57 L 29 60 Z" fill="var(--color-primary)" fillOpacity="0.08" stroke="var(--color-primary)" strokeWidth="1.8" />
                        <path d="M 22 50 L 50 25 L 76 36" fill="none" stroke="var(--color-primary)" strokeWidth="1" strokeDasharray="3 2" />
                        <circle cx="49" cy="17" r="2.2" fill="var(--color-primary)" />
                        <circle cx="82" cy="31" r="2.2" fill="var(--color-primary)" />
                        <circle cx="65" cy="57" r="2.2" fill="var(--color-primary)" />
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
