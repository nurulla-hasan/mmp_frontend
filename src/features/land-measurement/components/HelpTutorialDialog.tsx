"use client";

import {
  Upload,
  Ruler,
  PenTool,
  Scissors,
  Calculator,
  BookmarkCheck,
  Eye,
  MousePointerClick,
  HelpCircle,
} from "lucide-react";

import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Button } from "@/components/ui/button";

interface HelpTutorialDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const STEPS = [
  {
    step: "১",
    title: "ম্যাপ আপলোড করুন (Upload Map)",
    icon: Upload,
    description:
      "কম্পিউটার বা ফোন থেকে মৌজা ম্যাপের ইমেজ (JPG, PNG) বা PDF ফাইল আপলোড করুন। গুগল ড্রাইভে সেভ থাকা ম্যাপও সরাসরি আনতে পারেন।",
  },
  {
    step: "২",
    title: "স্কেল নির্ধারণ করুন (Set Scale)",
    icon: Ruler,
    description:
      "ডিজিটাল PDF হলে স্বয়ংক্রিয়ভাবে স্কেল শনাক্ত হবে। অন্যথায় জানা কোনো দূরত্বের (যেমন: ৬৬০ ফুট বা ৩৩০ ফুট গুনিয়া লাইন) দুই প্রান্তে ক্লিক করে স্কেল সেট করুন।",
  },
  {
    step: "৩",
    title: "দাগ বা প্লট অঙ্কন করুন (Draw Plot)",
    icon: PenTool,
    description:
      "কলম টুল সিলেক্ট করে ম্যাপের দাগের প্রতিটি কোণায় ক্লিক করুন। শেষ বিন্দুটি শুরুর বিন্দুর ওপর ক্লিক করে মিলিয়ে দাগটি সম্পূর্ণ করুন।",
  },
  {
    step: "৪",
    title: "পরিমাপ ও ক্ষেত্রফল দেখুন (View Results)",
    icon: Calculator,
    description:
      "প্লট আঁকা শেষ হলেই সাথে সাথে শতক, কাঠা, বর্গফুট ও প্রতিটি বাহুর দৈর্ঘ্য নিখুঁতভাবে হিসেব হয়ে ফলাফল বক্সে প্রদর্শিত হবে।",
  },
  {
    step: "৫",
    title: "প্লট ভাগ বা বাটোয়ারা (Divide Plot)",
    icon: Scissors,
    description:
      "এক দাগের জমি ভাগ করতে কাঁচি টুল দিয়ে দাগের যেকোনো দুই প্রান্ত বরাবর বিভাজন রেখা টানুন। সাথে সাথে পৃথক অংশের পরিমাপ দেখা যাবে।",
  },
  {
    step: "৬",
    title: "সংরক্ষণ ও প্রিন্ট (Save & Print)",
    icon: BookmarkCheck,
    description:
      "আপনার কাজ পরবর্তীতে ব্যবহারের জন্য ক্লাউডে সংরক্ষণ করুন অথবা প্রফেশনাল পরিমাপ প্রতিবেদন হিসেবে সরাসরি প্রিন্ট বা PDF ডাউনলোড করুন।",
  },
];

const TIPS = [
  {
    icon: MousePointerClick,
    title: "জুম ও প্যান",
    desc: "মাউস স্ক্রল দিয়ে জুম ইন/আউট করুন এবং মাউস টেনে ম্যাপ সরান।",
  },
  {
    icon: Eye,
    title: "কর্ণের মাপ",
    desc: "প্লটের কোণাকুণি মাপ ও কর্ণ দেখতে কর্ণ টুল ব্যবহার করুন।",
  },
];

export function HelpTutorialDialog({ open, onOpenChange }: HelpTutorialDialogProps) {
  return (
    <ModalWrapper
      open={open}
      onOpenChange={onOpenChange}
      title="জমি পরিমাপ ব্যবহারের নির্দেশিকা"
      description="সহজ ৬টি ধাপে মৌজা ম্যাপ থেকে যেকোনো দাগ বা প্লটের নিখুঁত পরিমাপ করুন"
    >
      <div className="space-y-6">
        {/* Steps List */}
        <div className="space-y-3">
          {STEPS.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.step}
                className="flex items-start gap-3.5 rounded-xl border border-border/70 bg-card p-3.5 transition-colors hover:border-primary/40 hover:bg-muted/30"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Icon className="size-4.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
                      {item.step}
                    </span>
                    <h4 className="text-sm font-semibold text-foreground">
                      {item.title}
                    </h4>
                  </div>
                  <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Tips */}
        <div className="rounded-xl border border-border bg-muted/40 p-4 space-y-2.5">
          <h5 className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-foreground">
            <HelpCircle className="size-3.5 text-primary" />
            প্রয়োজনীয় টিপস
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 pt-1">
            {TIPS.map((tip, idx) => {
              const TipIcon = tip.icon;
              return (
                <div
                  key={idx}
                  className="rounded-lg border border-border/60 bg-background/80 p-2.5 space-y-1"
                >
                  <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <TipIcon className="size-3.5 text-primary shrink-0" />
                    <span>{tip.title}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed text-muted-foreground">
                    {tip.desc}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Footer Action */}
        <div className="flex justify-end pt-1">
          <Button onClick={() => onOpenChange(false)}>
            বুঝেছি, শুরু করুন
          </Button>
        </div>
      </div>
    </ModalWrapper>
  );
}
