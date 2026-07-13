import { ArrowRight, ExternalLink, Save } from "lucide-react";
import Link from "next/link";

import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const sampleRecords = [
  {
    name: "দিনাজপুর সদর জমি",
    scale: "1:2.3",
    plots: 3,
    area: "৪২.৭৫ শতাংশ",
    updated: "২ দিন আগে",
  },
  {
    name: "বিরল গ্রামের জমি",
    scale: "1:1.0",
    plots: 2,
    area: "১৮.৪০ শতাংশ",
    updated: "৫ দিন আগে",
  },
  {
    name: "পারিবারিক জমি ভাগ",
    scale: "1:2.3",
    plots: 5,
    area: "৬৫.২০ শতাংশ",
    updated: "১ সপ্তাহ আগে",
  },
];

export function SavedCalculationsSection() {
  return (
    <SectionWrapper id="calculations" padding="md">
      <div className="grid gap-10 lg:grid-cols-[42fr_58fr] lg:items-center">
        {/* Left: Content (42%) */}
        <div>
          <span className="inline-block rounded-full border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
            Calculation Workspace
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            হিসাব সংরক্ষণ করে পরে আবার শুরু করুন
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            একটি calculation project-এর মধ্যে একাধিক plot যোগ করুন, scale ও
            মোট ক্ষেত্রফল সংরক্ষণ করুন এবং পরে যেকোনো সময় কাজ চালিয়ে যান।
          </p>
          <ul className="mt-6 space-y-3">
            {[
              "একটি project-এ একাধিক plot",
              "Scale ও measurement সংরক্ষণ",
              "Auto calculation ও rename",
              "PDF/Print export",
              "Request-এর সঙ্গে calculation যুক্ত করুন",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm">
                <span className="mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <svg className="size-2.5" viewBox="0 0 24 24" fill="currentColor"><path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41z"/></svg>
                </span>
                {item}
              </li>
            ))}
          </ul>
          <Button
            className="mt-6 h-10 md:h-11 px-6"
            nativeButton={false}
            render={<Link href="/dashboard/calculations" />}
          >
            আমার Calculation দেখুন
            <ExternalLink className="size-4" />
          </Button>
        </div>

        {/* Right: Dashboard mockup (58%) */}
        <Card className="overflow-hidden rounded-xl border shadow-sm">
          <CardContent className="p-0">
            {/* Header bar */}
            <div className="flex items-center justify-between border-b bg-muted/30 px-4 py-3 sm:px-5">
              <div className="flex items-center gap-2">
                <Save className="size-4 text-primary" />
                <span className="text-sm font-semibold">My Calculations</span>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-muted-foreground">৩টি project</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 text-xs gap-1"
                  nativeButton={false}
                  render={<Link href="/dashboard/calculations" />}
                >
                  View all <ArrowRight className="size-3" />
                </Button>
              </div>
            </div>
            <Separator className="m-0" />
            <div className="p-4 sm:p-5">
              {/* Header row */}
              <div className="hidden grid-cols-[2.5fr_1fr_1fr_1.5fr_1.5fr_auto] gap-3 px-2 pb-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>নাম</span>
                <span>Scale</span>
                <span>প্লট</span>
                <span>ক্ষেত্রফল</span>
                <span>হালনাগাদ</span>
                <span />
              </div>
              <div className="space-y-2">
                {sampleRecords.map((r) => (
                  <div
                    key={r.name}
                    className="grid grid-cols-1 gap-1.5 rounded-lg bg-muted/40 px-3 py-3 sm:grid-cols-[2.5fr_1fr_1fr_1.5fr_1.5fr_auto] sm:items-center sm:gap-3"
                  >
                    <span className="text-sm font-medium">{r.name}</span>
                    <span className="text-xs text-muted-foreground">{r.scale}</span>
                    <span className="text-xs text-muted-foreground">{r.plots}টি</span>
                    <span className="text-xs font-medium">{r.area}</span>
                    <span className="text-xs text-muted-foreground">{r.updated}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="size-7 justify-self-start sm:justify-self-end"
                      nativeButton={false}
                      render={<Link href="/dashboard/calculations" />}
                    >
                      <ArrowRight className="size-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
