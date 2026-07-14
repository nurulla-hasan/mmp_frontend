import { Calculator, Map, MoveDiagonal, Scaling } from "lucide-react";
import Link from "next/link";

import { PageWrapper } from "@/components/shared/page-wrapper";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

const featuredTool = {
 icon: Map,
 title: "মৌজা ম্যাপ ও জমি পরিমাপ",
 description:
 "মৌজা ম্যাপ আপলোড করে Plot আঁকুন, জমির পরিমাণ হিসাব করুন এবং প্রয়োজন হলে Plot ভাগ করুন।",
 href: "/tools/land-measurement",
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
 icon: MoveDiagonal,
 title: "জমির একক রূপান্তর",
 description:
 "শতক, কাঠা, বিঘা, একর, বর্গফুট, বর্গমিটার ও হেক্টরে জমির পরিমাণ রূপান্তর করুন।",
 href: "/tools/unit-converter",
 color:
 "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
 },
 {
 icon: Calculator,
 title: "জমি বণ্টন ক্যালকুলেটর",
 description:
 "মোট জমি ও অংশীদারদের অনুপাত অনুযায়ী প্রত্যেকের প্রাপ্য জমির পরিমাণ নির্ণয় করুন।",
 href: "/tools/inheritance-calculator",
 color: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30",
 },
 {
 icon: Scaling,
 title: "ম্যাপ স্কেল ও প্যান্টাগ্রাফ",
 description:
 "ম্যাপের স্কেল হিসাব করুন, এক স্কেল থেকে অন্য স্কেলে রূপান্তর করুন এবং প্যান্টাগ্রাফ রেশিও বের করুন।",
 href: "/tools/pantagraph",
 color:
 "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30",
 },
];

export default function ToolsPage() {
 const FeaturedIcon = featuredTool.icon;

 return (
 <PageWrapper className="space-y-10">
 {/* ─── Featured Tool ──────────────────────────────────── */}
 <section>
 <Link href={featuredTool.href} className="group block">
 <Card className="relative overflow-hidden border-2 border-primary/20 transition-all duration-300 hover:border-primary/40 hover:shadow-xl hover:shadow-primary/10">
 {/* Background gradient */}
 <div className="pointer-events-none absolute -inset-y-20 left-1/2 w-150 -translate-x-1/2 rounded-full bg-primary/3 " />

 <CardContent className="relative p-6 sm:p-8">
 <div className="flex flex-col items-start gap-6 sm:flex-row sm:items-center">
 {/* Icon */}
 <div className="flex size-16 shrink-0 items-center justify-center rounded-2xl bg-primary/10 shadow-lg shadow-primary/10 ring-2 ring-primary/20">
 <FeaturedIcon className="size-8 text-primary" />
 </div>

 {/* Content */}
 <div className="min-w-0 flex-1">
 <div className="flex flex-wrap items-center gap-3">
 <h2 className="text-xl font-bold tracking-tight sm:text-2xl font-heading">
 {featuredTool.title}
 </h2>
 <Badge className="bg-primary/10 p-2 text-xs text-primary hover:bg-primary/20">
 প্রধান টুল
 </Badge>
 </div>
 <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
 {featuredTool.description}
 </p>

 {/* Feature chips */}
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

 {/* CTA */}
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
 <h2 className="text-lg font-semibold font-heading">কুইক টুলস</h2>
 <p className="mt-1 text-sm text-muted-foreground">
 দ্রুত প্রয়োজনীয় গণনার জন্য সহায়ক টুলসমূহ।
 </p>

 <div className="mt-6 grid gap-6 md:grid-cols-3">
 {quickTools.map((tool) => {
 const Icon = tool.icon;
 return (
 <Link key={tool.href} href={tool.href} className="group">
 <Card className="h-full transition-all duration-300 hover:-translate-y-1 hover:ring-2 hover:ring-primary/30 hover:shadow-lg hover:shadow-primary/5">
 <CardContent>
 <div
 className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${tool.color}`}
 >
 <Icon className="size-6" />
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
 </PageWrapper>
 );
}
