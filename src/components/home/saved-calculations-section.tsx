import { ArrowRight, CheckCircle2, FileSpreadsheet, FolderKanban, Save, Table2 } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SectionWrapper } from "@/components/common/section-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";

const sampleRecords = [
  {
    name: "দিনাজপুর সদর জমি (দাগ ৪২৮)",
    scale: "১৬″ = ১ মাইল",
    plots: 3,
    area: "৪২.৭৫ শতাংশ",
    status: "সম্পন্ন",
    statusVariant: "success" as const,
  },
  {
    name: "বিরল গ্রামের খতিয়ান প্লট",
    scale: "৩২″ = ১ মাইল",
    plots: 2,
    area: "১৮.৪০ শতাংশ",
    status: "খসড়া",
    statusVariant: "progress" as const,
  },
  {
    name: "পারিবারিক জমি ভাগ-বাটোয়ারা",
    scale: "১৬″ = ১ মাইল",
    plots: 5,
    area: "৬৫.২০ শতাংশ",
    status: "সম্পন্ন",
    statusVariant: "success" as const,
  },
];

export function SavedCalculationsSection() {
  return (
    <SectionWrapper id="calculations" bg="muted">
      <div className="grid gap-10 lg:grid-cols-12 lg:items-center">
        {/* Left: Content */}
        <div className="lg:col-span-5 space-y-6">
          <SectionHeading
            badge="ক্যালকুলেশন ওয়ার্কস্পেস"
            title="হিসাব শুধু করবেন না—ক্লাউডে সেভ রাখুন"
            description="একটি প্রজেক্টের অধীনে একাধিক প্লটের পরিমাপ, দাগ নম্বর ও স্কেল সেভ রাখুন। যেকোনো ডিভাইস থেকে তাৎক্ষণিক অ্যাক্সেস করুন。"
            alignment="left"
            constrain={false}
          />

          <ul className="space-y-2.5 text-xs sm:text-sm text-muted-foreground">
            {[
              "একটি প্রজেক্টে আনলিমিটেড প্লট ও বহুভুজ সংরক্ষণ",
              "C.S, S.A ও B.S স্কেল রেশিও অটো-সেভ",
              "পিডিএফ ও প্রিন্ট-রেডি ফরম্যাটে রিপোর্ট এক্সপোর্ট",
              "সার্ভেয়ারদের সাথে সরাসরি প্রজেক্ট শেয়ারিং",
            ].map((item) => (
              <li key={item} className="flex items-start gap-2">
                <CheckCircle2 className="size-4 text-primary shrink-0 mt-0.5" />
                <span>{item}</span>
              </li>
            ))}
          </ul>

          <div className="pt-2">
            <Button
              size="lg"
              nativeButton={false}
              render={<Link href="/calculations" />}
              className="gap-2 shadow-xs"
            >
              <Table2 className="size-4" />
              আমার প্রজেক্ট ওয়ার্কস্পেস
            </Button>
          </div>
        </div>

        {/* Right: Dashboard Table Mockup */}
        <div className="lg:col-span-7">
          <Card className="rounded-2xl border border-border/80 bg-card shadow-sm overflow-hidden">
            <CardContent className="p-5 sm:p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="flex size-9 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FolderKanban className="size-4.5" />
                  </div>
                  <div>
                    <h4 className="font-heading font-semibold text-sm text-foreground">
                      সংরক্ষিত প্রজেক্ট তালিকা
                    </h4>
                    <p className="text-[11px] text-muted-foreground">
                      ক্লাউড সিঙ্কড হিস্ট্রি
                    </p>
                  </div>
                </div>
                <Badge variant="outline" className="text-xs">
                  ৩টি প্রজেক্ট
                </Badge>
              </div>

              <Separator className="my-4" />

              <div className="space-y-2.5">
                {sampleRecords.map((r) => (
                  <div
                    key={r.name}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-xl border border-border/60 bg-muted/30 p-3.5 transition-colors hover:bg-muted/60"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <FileSpreadsheet className="size-3.5 text-primary shrink-0" />
                        <span className="font-heading font-medium text-sm text-foreground truncate">
                          {r.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span>স্কেল: {r.scale}</span>
                        <span>•</span>
                        <span>{r.plots}টি প্লট</span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/40">
                      <div className="text-left sm:text-right">
                        <span className="font-heading font-bold text-sm text-foreground block">
                          {r.area}
                        </span>
                        <Badge
                          variant={r.statusVariant}
                          className="mt-0.5 text-[10px] px-1.5 py-0"
                        >
                          {r.status}
                        </Badge>
                      </div>

                      <Button
                        size="icon"
                        variant="ghost"
                        className="size-8 text-muted-foreground hover:text-foreground shrink-0"
                        nativeButton={false}
                        render={<Link href="/calculations" />}
                        aria-label="View project"
                      >
                        <ArrowRight className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </SectionWrapper>
  );
}
