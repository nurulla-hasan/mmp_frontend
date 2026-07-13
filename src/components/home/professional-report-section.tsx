import { Check, Download, Printer } from "lucide-react";
import Link from "next/link";

import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const checklist = [
  "মৌজা, খতিয়ান, দাগ ও জে.এল. নম্বর",
  "মোট জমির পরিমাণ",
  "প্রতিটি plot-এর আলাদা হিসাব",
  "Plot drawing ও measurement",
  "Surveyor ও client information",
  "Signature area সহ সম্পূর্ণ report",
  "PDF download এবং print",
];

export function ProfessionalReportSection() {
  return (
    <SectionWrapper id="reports" padding="md">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left: Content */}
        <div>
          <span className="inline-block rounded-full border bg-muted px-3 py-0.5 text-xs font-medium text-muted-foreground">
            PDF & Print Report
          </span>
          <h2 className="mt-3 text-2xl font-bold tracking-tight sm:text-3xl">
            হিসাব থেকে তৈরি করুন পেশাদার Report
          </h2>
          <p className="mt-3 text-sm leading-7 text-muted-foreground">
            জমির plot, মোট পরিমাণ ও প্রয়োজনীয় তথ্যসহ client-ready report তৈরি ও
            print করুন।
          </p>
          <ul className="mt-6 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          {/* Disclaimer - more visible */}
          <div className="mt-6 rounded-lg border border-amber-200 bg-amber-50/80 px-4 py-3 text-xs leading-5 text-amber-900 dark:border-amber-800/40 dark:bg-amber-900/15 dark:text-amber-200">
            <strong className="text-amber-950 dark:text-amber-100">⚠️ গুরুত্বপূর্ণ নোট:</strong> এই
            report হিসাব ও কাজের সহায়ক কপি। এটি সরকারি দলিল বা জমির মালিকানা
            প্রমাণ নয়।
          </div>
          <Button
            className="mt-6 h-10 md:h-11 px-6"
            nativeButton={false}
            render={<Link href="/tools" />}
          >
            Report Demo দেখুন
          </Button>
        </div>

        {/* Right: Paper/report mockup - 15-20% larger */}
        <div className="relative mx-auto w-full max-w-md">
          {/* Decorative depth layers */}
          <div className="absolute -bottom-3 left-6 right-6 top-3 rounded-2xl border bg-muted/40" />
          <div className="absolute -bottom-1.5 left-3 right-3 top-1.5 rounded-2xl border bg-muted/60" />
          <div className="relative rounded-2xl border-2 bg-white shadow-md dark:bg-card">
            <div className="p-6 sm:p-7">
              {/* Report header */}
              <div className="flex items-center justify-between border-b pb-4">
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-foreground">
                    Land Survey Report
                  </h3>
                  <p className="text-[10px] text-gray-500 dark:text-muted-foreground">
                    Report ID: MMP-2026-0042
                  </p>
                </div>
                <div className="flex gap-1.5 text-gray-400">
                  <Printer className="size-4" />
                  <Download className="size-4" />
                </div>
              </div>

              {/* Owner info */}
              <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-1.5 text-[10px]">
                <span className="text-gray-500 dark:text-muted-foreground">Owner:</span>
                <span className="font-medium text-gray-900 dark:text-foreground">মো. আব্দুর রহিম</span>
                <span className="text-gray-500 dark:text-muted-foreground">Mouza:</span>
                <span className="font-medium text-gray-900 dark:text-foreground">ছোট বাজার, দিনাজপুর</span>
                <span className="text-gray-500 dark:text-muted-foreground">Khatian:</span>
                <span className="font-medium text-gray-900 dark:text-foreground">খতিয়ান নং ১২৩</span>
                <span className="text-gray-500 dark:text-muted-foreground">Dag:</span>
                <span className="font-medium text-gray-900 dark:text-foreground">দাগ নং ৪৫, ৪৬, ৪৭</span>
              </div>

              <Separator className="my-4" />

              {/* Plot shapes with varied sizes */}
              <div>
                <p className="text-[10px] font-medium text-gray-700 dark:text-muted-foreground">Plot Layout</p>
                <div className="mt-2 flex gap-2">
                  <div className="flex aspect-square w-1/3 items-center justify-center rounded-lg border-2 border-emerald-500/40 bg-emerald-50 text-[9px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                    প্লট ১
                  </div>
                  <div className="flex aspect-4/3 w-1/3 items-center justify-center rounded-lg border-2 border-blue-500/40 bg-blue-50 text-[9px] font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                    প্লট ২
                  </div>
                  <div className="flex aspect-2/3 w-1/3 items-center justify-center rounded-lg border-2 border-amber-500/40 bg-amber-50 text-[9px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                    প্লট ৩
                  </div>
                </div>
              </div>

              {/* Measurements table */}
              <div className="mt-4 space-y-1.5 text-[10px]">
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-500 dark:text-muted-foreground">প্লট ১ (উত্তর)</span>
                  <span className="font-medium text-gray-900 dark:text-foreground">১৫.২৫ শতাংশ</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-500 dark:text-muted-foreground">প্লট ২ (মধ্য)</span>
                  <span className="font-medium text-gray-900 dark:text-foreground">১২.৮০ শতাংশ</span>
                </div>
                <div className="flex justify-between border-b pb-1.5">
                  <span className="text-gray-500 dark:text-muted-foreground">প্লট ৩ (দক্ষিণ)</span>
                  <span className="font-medium text-gray-900 dark:text-foreground">১৪.৭০ শতাংশ</span>
                </div>
                <div className="flex justify-between pt-1.5">
                  <span className="text-xs font-semibold text-gray-900 dark:text-foreground">মোট জমি</span>
                  <span className="text-xs font-bold text-primary">৪২.৭৫ শতাংশ</span>
                </div>
              </div>

              <Separator className="my-4" />

              {/* Signature area */}
              <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-500 dark:text-muted-foreground">
                <div>
                  <p className="border-t pt-1.5">Surveyor Signature</p>
                </div>
                <div>
                  <p className="border-t pt-1.5">Client Signature</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
