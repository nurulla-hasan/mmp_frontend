import { ArrowRight, Save, Table2 } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
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
  },
  {
    name: "বিরল গ্রামের জমি",
    scale: "1:1.0",
    plots: 2,
    area: "১৮.৪০ শতাংশ",
  },
  {
    name: "পারিবারিক জমি ভাগ",
    scale: "1:2.3",
    plots: 5,
    area: "৬৫.২০ শতাংশ",
  },
];

export function SavedCalculationsSection() {
  return (
    <SectionWrapper id="calculations" bg="muted">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left: Content */}
        <div>
          <SectionHeading
            badge="ক্যালকুলেশন ওয়ার্কস্পেস"
            title="হিসাব শুধু করবেন না—সংরক্ষণ করে পরে আবার শুরু করুন"
            description="একটি ক্যালকুলেশন প্রজেক্ট-এর মধ্যে একাধিক প্লট যোগ করুন, স্কেল ও মোট ক্ষেত্রফল সংরক্ষণ করুন এবং পরে যেকোনো সময় কাজ চালিয়ে যান。"
            alignment="left"
            constrain={false}
          />
          <ul className="mt-6 space-y-3">
            {[
              "একটি প্রজেক্ট-এ একাধিক প্লট",
              "স্কেল ও মেজারমেন্ট সংরক্ষণ",
              "অটো ক্যালকুলেশন",
              "নাম পরিবর্তন ও ডুপ্লিকেট",
              "PDF/Print এক্সপোর্ট",
              "রিকোয়েস্ট-এর সঙ্গে ক্যালকুলেশন যুক্ত করার সুযোগ",
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
            className="mt-6"
            nativeButton={false}
            render={<Link href="/dashboard/calculations" />}
          >
            <Table2 className="size-4" />
            আমার ক্যালকুলেশন দেখুন
          </Button>
        </div>

        {/* Right: Dashboard mockup */}
        <Card className="rounded-xl ring-1 ring-border">
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Save className="size-4 text-primary" />
                <span className="text-sm font-medium">আমার ক্যালকুলেশন</span>
              </div>
              <span className="text-xs text-muted-foreground">৩টি প্রজেক্ট</span>
            </div>
            <Separator className="my-3" />
            <div className="space-y-2">
              {/* Header row */}
              <div className="hidden grid-cols-[3fr_1fr_1fr_1.5fr_auto] gap-2 px-2 text-xs font-medium text-muted-foreground sm:grid">
                <span>নাম</span>
                <span>স্কেল</span>
                <span>প্লট</span>
                <span>ক্ষেত্রফল</span>
                <span />
              </div>
              {sampleRecords.map((r) => (
                <div
                  key={r.name}
                  className="grid grid-cols-1 gap-1 rounded-lg bg-muted/50 px-3 py-2.5 sm:grid-cols-[3fr_1fr_1fr_1.5fr_auto] sm:items-center sm:gap-2"
                >
                  <span className="text-sm font-medium">{r.name}</span>
                  <span className="text-xs text-muted-foreground">{r.scale}</span>
                  <span className="text-xs text-muted-foreground">{r.plots}টি</span>
                  <span className="text-xs text-muted-foreground">{r.area}</span>
                  <Button
                    size="xs"
                    variant="ghost"
                    className="justify-self-start sm:justify-self-end"
                    nativeButton={false}
                    render={<Link href="/dashboard/calculations" />}
                  >
                    <ArrowRight className="size-3" />
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </SectionWrapper>
  );
}
