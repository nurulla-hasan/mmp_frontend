import { Check, Download, Printer } from "lucide-react";
import Link from "next/link";

import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";

const checklist = [
  "মৌজা, খতিয়ান, দাগ ও জে.এল. নম্বর",
  "মোট জমির পরিমাণ",
  "প্রতিটি plot-এর আলাদা হিসাব",
  "Plot drawing",
  "Surveyor ও client information",
  "Signature area",
  "PDF download এবং print",
];

export function ProfessionalReportSection() {
  return (
    <SectionWrapper id="reports" bg="muted">
      <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
        {/* Left: Content */}
        <div>
          <SectionHeading
            badge="PDF & Print Report"
            title="হিসাব থেকে তৈরি করুন পরিষ্কার Professional Report"
            description="জমির plot, মোট পরিমাণ ও প্রয়োজনীয় তথ্যসহ client-ready report তৈরি ও print করুন।"
            alignment="left"
            constrain={false}
          />
          <ul className="mt-6 space-y-3">
            {checklist.map((item) => (
              <li key={item} className="flex items-start gap-2 text-sm text-muted-foreground">
                <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>
          {/* Disclaimer */}
          <div className="mt-6 rounded-lg border bg-amber-50/50 px-4 py-3 text-xs leading-5 text-amber-800 dark:bg-amber-900/10 dark:text-amber-300">
            <strong>নোট:</strong> এই report হিসাব ও কাজের সহায়ক কপি। এটি সরকারি
            দলিল বা সরকারি মালিকানা প্রমাণ নয়।
          </div>
          <Button
            className="mt-6"
            nativeButton={false}
            render={<Link href="/tools" />}
          >
            Report Demo দেখুন
          </Button>
        </div>

        {/* Right: Paper/report mockup */}
        <div className="relative mx-auto w-full max-w-sm">
          {/* Decorative shadow */}
          <div className="absolute -bottom-2 left-4 right-4 top-2 rounded-2xl border bg-muted/50" />
          <div className="relative rounded-2xl border-2 bg-white p-6 shadow-sm dark:bg-card">
            {/* Report header */}
            <div className="flex items-center justify-between border-b pb-3">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-900 dark:text-foreground">
                  Land Survey Report
                </h3>
                <p className="text-[10px] text-gray-500 dark:text-muted-foreground">
                  Report ID: MMP-2026-0042
                </p>
              </div>
              <div className="flex gap-1 text-gray-400">
                <Printer className="size-3.5" />
                <Download className="size-3.5" />
              </div>
            </div>

            {/* Owner info */}
            <div className="mt-3 grid grid-cols-2 gap-x-4 gap-y-1 text-[10px]">
              <span className="text-gray-500 dark:text-muted-foreground">Owner:</span>
              <span className="font-medium text-gray-900 dark:text-foreground">মো. আব্দুর রহিম</span>
              <span className="text-gray-500 dark:text-muted-foreground">Mouza:</span>
              <span className="font-medium text-gray-900 dark:text-foreground">ছোট বাজার, দিনাজপুর</span>
              <span className="text-gray-500 dark:text-muted-foreground">Khatian:</span>
              <span className="font-medium text-gray-900 dark:text-foreground">খতিয়ান নং ১২৩</span>
              <span className="text-gray-500 dark:text-muted-foreground">Dag:</span>
              <span className="font-medium text-gray-900 dark:text-foreground">দাগ নং ৪৫, ৪৬, ৪৭</span>
            </div>

            <Separator className="my-3" />

            {/* Plot shapes */}
            <div>
              <p className="text-[10px] font-medium text-gray-700 dark:text-muted-foreground">Plot Layout</p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <div className="flex aspect-3/2 items-center justify-center rounded border-2 border-emerald-500/40 bg-emerald-50 text-[9px] font-medium text-emerald-700 dark:bg-emerald-950/30 dark:text-emerald-400">
                  প্লট ১
                </div>
                <div className="flex aspect-3/2 items-center justify-center rounded border-2 border-blue-500/40 bg-blue-50 text-[9px] font-medium text-blue-700 dark:bg-blue-950/30 dark:text-blue-400">
                  প্লট ২
                </div>
                <div className="flex aspect-3/2 items-center justify-center rounded border-2 border-amber-500/40 bg-amber-50 text-[9px] font-medium text-amber-700 dark:bg-amber-950/30 dark:text-amber-400">
                  প্লট ৩
                </div>
              </div>
            </div>

            {/* Measurements table */}
            <div className="mt-3 space-y-1 text-[10px]">
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500 dark:text-muted-foreground">প্লট ১ (উত্তর)</span>
                <span className="font-medium text-gray-900 dark:text-foreground">১৫.২৫ শতাংশ</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500 dark:text-muted-foreground">প্লট ২ (মধ্য)</span>
                <span className="font-medium text-gray-900 dark:text-foreground">১২.৮০ শতাংশ</span>
              </div>
              <div className="flex justify-between border-b pb-1">
                <span className="text-gray-500 dark:text-muted-foreground">প্লট ৩ (দক্ষিণ)</span>
                <span className="font-medium text-gray-900 dark:text-foreground">১৪.৭০ শতাংশ</span>
              </div>
              <div className="flex justify-between pt-1">
                <span className="text-xs font-semibold text-gray-900 dark:text-foreground">মোট জমি</span>
                <span className="text-xs font-bold text-primary">৪২.৭৫ শতাংশ</span>
              </div>
            </div>

            <Separator className="my-3" />

            {/* Signature area */}
            <div className="grid grid-cols-2 gap-4 text-[9px] text-gray-500 dark:text-muted-foreground">
              <div>
                <p className="border-t pt-1">Surveyor Signature</p>
              </div>
              <div>
                <p className="border-t pt-1">Client Signature</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </SectionWrapper>
  );
}
