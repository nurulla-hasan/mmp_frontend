import {
  Calculator,
  Grid3X3,
  Map,
  MoveDiagonal,
  Ruler,
  Scaling,
  SlidersHorizontal,
} from "lucide-react";
import Link from "next/link";

import { PageWrapper } from "@/components/shared/page-wrapper";
import { Card, CardContent } from "@/components/ui/card";

const tools = [
  {
    icon: Ruler,
    title: "জমির ক্ষেত্রফল",
    description:
      "আয়তক্ষেত্র, ত্রিভুজ ও অসম আকৃতির জমির সঠিক মাপ ও ক্ষেত্রফল গণনা করুন বাংলাদেশী এককে।",
    href: "/tools/land-measurement",
    color:
      "text-emerald-600 bg-emerald-100 dark:text-emerald-400 dark:bg-emerald-900/30",
  },
  {
    icon: Grid3X3,
    title: "জমি ভাগ",
    description:
      "জমি সমান অনুপাতে বা নির্দিষ্ট ভাগে ভাগ করে প্রতিটি প্লটের পৃথক হিসাব দেখুন।",
    href: "/tools/land-division",
    color: "text-blue-600 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30",
  },
  {
    icon: MoveDiagonal,
    title: "একক রূপান্তর",
    description:
      "শতাংশ, কাঠা, বিঘা, একর, হেক্টর ও বর্গমিটারের মধ্যে জমির একক পরিবর্তন করুন।",
    href: "/tools/unit-converter",
    color:
      "text-purple-600 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30",
  },
  {
    icon: SlidersHorizontal,
    title: "ক্ষেত্রফল রূপান্তর",
    description:
      "বিভিন্ন ক্ষেত্রফল এককে মান পরিবর্তন করে দ্রুত তুলনা ও গণনা সম্পন্ন করুন।",
    href: "/tools/area-converter",
    color:
      "text-amber-600 bg-amber-100 dark:text-amber-400 dark:bg-amber-900/30",
  },
  {
    icon: Map,
    title: "জমি বন্টন ক্যালকুলেটর",
    description: "ওয়ারিশ সূত্র অনুযায়ী জমির অংশ নির্ধারণ ও বন্টন গণনা করুন।",
    href: "/tools/inheritance-calculator",
    color: "text-rose-600 bg-rose-100 dark:text-rose-400 dark:bg-rose-900/30",
  },
  {
    icon: Scaling,
    title: "প্যান্টাগ্রাফ",
    description:
      "জমির নকশা বা ম্যাপ নির্দিষ্ট স্কেলে বড় বা ছোট করে দেখুন প্যান্টাগ্রাফ পদ্ধতিতে।",
    href: "/tools/pantagraph",
    color:
      "text-cyan-600 bg-cyan-100 dark:text-cyan-400 dark:bg-cyan-900/30",
  },
];

export default function ToolsPage() {
  return (
    <>
      <PageWrapper>
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link key={tool.href} href={tool.href} className="group">
                <Card className="h-full transition-all hover:ring-2 hover:ring-primary/30 hover:shadow-md">
                  <CardContent>
                    <div
                      className={`mb-4 inline-flex size-12 items-center justify-center rounded-xl ${tool.color}`}
                    >
                      <Icon className="size-6" />
                    </div>
                    <h2 className="text-lg font-semibold font-heading">
                      {tool.title}
                    </h2>
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
      </PageWrapper>
    </>
  );
}
