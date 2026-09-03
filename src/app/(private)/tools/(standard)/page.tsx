import type { Metadata } from "next";
import { Calculator, Globe2, Layers3, Map, MoveDiagonal, PenLine, Ruler, Scaling } from "lucide-react";
import Link from "next/link";

import { PageWrapper } from "@/components/common/page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "ডিজিটাল ল্যান্ড টুলস — মৌজা ম্যাপ ও জমি পরিমাপের সফটওয়্যার",
  description:
    "মৌজা ম্যাপ ক্যালকুলেটর, ডিজিটাল ট্রেসিং, প্যান্টাগ্রাফ স্কেলিং, ইউনিট কনভার্টার এবং জমি বণ্টন ক্যালকুলেটরের সমন্বয়ে আধুনিক ডিজিটাল ভূমি পরিমাপ টুলবক্স।",
  keywords: [
    "ল্যান্ড টুলস",
    "জমি পরিমাপের সফটওয়্যার",
    "মৌজা ম্যাপ ক্যালকুলেটর",
    "Land Measurement Tools",
    "Digital Land Tools",
  ],
  alternates: {
    canonical: "/tools",
  },
  openGraph: {
    title: "ডিজিটাল ল্যান্ড টুলস — মৌজা ম্যাপ ও জমি পরিমাপের সফটওয়্যার | Mouza Map Pro",
    description:
      "মৌজা ম্যাপ ক্যালকুলেটর, ডিজিটাল ট্রেসিং, প্যান্টাগ্রাফ স্কেলিং, ইউনিট কনভার্টার এবং জমি বণ্টন ক্যালকুলেটর।",
    url: "/tools",
  },
};

const featuredTool = {
  icon: Map,
  title: "মৌজা ম্যাপ ও জমি পরিমাপ",
  description:
    "মৌজা ম্যাপ আপলোড করে Plot আঁকুন, জমির পরিমাণ হিসাব করুন এবং প্রয়োজন হলে Plot ভাগ করুন।",
  href: "/tools/land-measurement",
  isPro: true,
  features: [
    "ম্যাপ/PDF আপলোড",
    "স্কেল সেট",
    "Plot আঁকা ও ক্ষেত্রফল",
    "একাধিক Plot ভাগ",
    "মোট হিসাব",
    "PDF/Print রিপোর্ট",
  ],
};

const quickTools = [
  {
    icon: Layers3,
    title: "মৌজা ম্যাপ স্টুডিও",
    description:
      "C.S ও B.S ম্যাপ align করে cleanup, text/mark edit করুন এবং শেষে ব্যবহারযোগ্য sheet তৈরি করুন।",
    href: "/tools/mouza-map-studio",
    badge: "বেটা",
    isPro: true,
    color: "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  },
  {
    icon: Globe2,
    title: "মৌজা জিও স্টুডিও",
    description:
      "মৌজা ম্যাপকে বাস্তব পৃথিবীর অবস্থানের সঙ্গে align করে Google Earth-এর জন্য KMZ তৈরি করুন।",
    href: "/tools/mouza-geo-studio",
    badge: "বেটা",
    isPro: true,
    color: "text-primary bg-primary/10",
  },
  {
    icon: Scaling,
    title: "ম্যাপ তুলনা ও প্যান্টাগ্রাফ",
    description:
      "সাবেক ও হাল ম্যাপ আপলোড করে matching point বসিয়ে অবস্থান, rotation ও scale মিলিয়ে তুলনা করুন।",
    href: "/tools/pantagraph",
    badge: "নতুন",
    isPro: true,
    color: "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30",
  },
  {
    icon: PenLine,
    title: "ডিজিটাল ম্যাপ ট্রেসিং",
    description:
      "পুরানো মৌজা ম্যাপের দাগের সীমানা ও দাগ নম্বর ট্রেস করে পরিষ্কার digital vector map তৈরি করুন।",
    href: "/tools/tracer",
    badge: "নতুন",
    isPro: true,
    color: "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  },
  {
    icon: MoveDiagonal,
    title: "জমির একক রূপান্তর",
    description:
      "শতক, কাঠা, বিঘা, একর, বর্গফুট, বর্গমিটার ও হেক্টরে জমির পরিমাণ রূপান্তর করুন।",
    href: "/tools/unit-converter",
    isPro: false,
    color:
      "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
  },
  {
    icon: Calculator,
    title: "জমি বণ্টন ক্যালকুলেটর",
    description:
      "মোট জমি ও অংশীদারদের অনুপাত অনুযায়ী প্রত্যেকের প্রাপ্য জমির পরিমাণ নির্ণয় করুন।",
    href: "/tools/inheritance-calculator",
    isPro: false,
    color: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30",
  },
];

export default function ToolsPage() {
  const FeaturedIcon = featuredTool.icon;

  return (
    <PageWrapper paddingSize="large" className="space-y-8">
      {/* ─── Featured Tool ──────────────────────────────────── */}
      <section>
        <Link href={featuredTool.href} className="group block">
          <Card className="relative overflow-hidden border-2 border-primary/20 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
            <div className="pointer-events-none absolute -inset-y-20 left-1/2 w-150 -translate-x-1/2 rounded-full bg-primary/3 " />

            <CardContent className="relative">
              <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
                <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/20">
                  <FeaturedIcon className="size-8 text-primary" />
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h2 className="text-xl font-bold tracking-tight sm:text-2xl font-heading">
                      {featuredTool.title}
                    </h2>
                    <Badge className="bg-emerald-600 text-white text-xs font-semibold px-2 py-0.5 shadow-sm">
                      PRO
                    </Badge>
                    <Badge className="bg-primary/10 p-2 text-xs text-primary hover:bg-primary/20">
                      প্রধান টুল
                    </Badge>
                  </div>
                  <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
                    {featuredTool.description}
                  </p>

                  <div className="mt-4 flex flex-wrap gap-2">
                    {featuredTool.features.map((f) => (
                      <span
                        key={f}
                        className="rounded-md bg-primary/5 px-2.5 py-1 text-xs text-muted-foreground ring-1 ring-primary/10"
                      >
                        {f}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="shrink-0">
                  <Button size="lg" className="w-full sm:w-auto">
                    টুল খুলুন
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </Link>
      </section>

      {/* ─── Quick Tools ────────────────────────────────────── */}
      <section>
        <h2 className="text-lg font-semibold font-heading">অন্যান্য টুলস</h2>
        <p className="mt-1 text-sm text-muted-foreground">
          বিশেষায়িত ম্যাপ, ট্রেসিং, জিওরেফারেন্স ও ভূমি হিসাবের টুলসমূহ।
        </p>

        <div className="mt-6 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {quickTools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group">
                <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-primary/30 hover:shadow-lg hover:shadow-primary/5">
                  <CardContent>
                    <div className="flex items-start justify-between mb-4">
                      <div
                        className={`inline-flex size-12 items-center justify-center rounded-xl ${tool.color}`}
                      >
                        <Icon className="size-6" />
                      </div>
                      <div className="flex items-center gap-1.5">
                        {tool.isPro ? (
                          <Badge className="bg-emerald-600/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/20 text-xs px-1.5 py-0.5 font-semibold">
                            PRO
                          </Badge>
                        ) : (
                          <Badge className="bg-blue-600/15 text-blue-700 dark:text-blue-400 border border-blue-500/20 text-xs px-1.5 py-0.5 font-medium">
                            ফ্রি
                          </Badge>
                        )}
                        {"badge" in tool && tool.badge && (
                          <Badge className="bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400 text-xs px-1.5 py-0.5">
                            {tool.badge}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <h3 className="text-base font-semibold font-heading">
                      {tool.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {tool.description}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-sm font-medium text-primary">
                      টুল খুলুন <Calculator className="size-4" />
                    </span>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      </section>

      {/* ─── Educational & Scale Guide Banner ───────────────── */}
      <section className="pt-2">
        <Link href="/tools/scale-guide" className="group block">
          <Card className="border-dashed border-2 border-primary/25 bg-primary/5 transition-all duration-300 hover:border-primary/50 hover:bg-primary/10 hover:shadow-md">
            <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="flex size-12 shrink-0 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-sm">
                  <Ruler className="size-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold font-heading">
                      মৌজা ম্যাপ স্কেল সেট ও ব্যবহার নির্দেশিকা
                    </h3>
                    <Badge variant="outline" className="border-primary/40 text-primary text-xs px-2">
                      গাইডলাইন ও সহায়তা
                    </Badge>
                  </div>
                  <p className="mt-1 text-xs sm:text-sm text-muted-foreground">
                    মৌজা ম্যাপে নিখুঁত পরিমাপের জন্য ১৬ ইঞ্চি = ১ মাইল বা কাস্টম স্কেল কীভাবে সেট করতে হয় এবং কাজ করার নিয়মাবলী জেনে নিন।
                  </p>
                </div>
              </div>
              <Button variant="outline" className="shrink-0 group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                স্কেল গাইড দেখুন 📖
              </Button>
            </CardContent>
          </Card>
        </Link>
      </section>
    </PageWrapper>
  );
}
