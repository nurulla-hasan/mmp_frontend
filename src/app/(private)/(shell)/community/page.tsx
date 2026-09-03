import type { Metadata } from "next";
import { MessageSquarePlus, Users } from "lucide-react";

import { CONTAINER_MAX_WIDTH } from "@/components/common/page-wrapper";
import { AskQuestionModal } from "./_components/ask-question-modal";
import { CommunityFeed } from "./_components/community-feed";

export const metadata: Metadata = {
  title: "ভূমি সেবা কমিউনিটি ও প্রশ্নোত্তর ফোরাম — বিশেষজ্ঞ পরামর্শ",
  description:
    "জমি পরিমাপ, মৌজা ম্যাপ, খতিয়ান, উত্তরাধিকার বণ্টন বা আইন সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞাসা করুন এবং অভিজ্ঞ আমিন ও পেশাদারদের পরামর্শ নিন।",
  keywords: [
    "ভূমি কমিউনিটি",
    "জমি সংক্রান্ত প্রশ্নোত্তর",
    "আমিন ফোরাম",
    "Land Community Bangladesh",
    "Q&A Forum",
  ],
  alternates: {
    canonical: "/community",
  },
  openGraph: {
    title: "ভূমি সেবা কমিউনিটি ও প্রশ্নোত্তর ফোরাম | Mouza Map Pro",
    description:
      "জমি পরিমাপ, মৌজা ম্যাপ, খতিয়ান, উত্তরাধিকার বণ্টন বা আইন সংক্রান্ত যেকোনো প্রশ্ন জিজ্ঞাসা করুন।",
    url: "/community",
  },
};

export default function CommunityPage() {
  return (
    <div className="min-h-screen bg-muted/20">
      {/* ─── Compact Community Header ──────────────────────── */}
      <div className="border-b border-border/70 bg-card shadow-2xs">
        <div className={`${CONTAINER_MAX_WIDTH} mx-auto px-4 py-4 sm:py-5`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <Users className="size-4.5" />
                </div>
                <h1 className="text-xl sm:text-2xl font-bold font-heading text-foreground">
                  ভূমি সেবা কমিউনিটি
                </h1>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-normal bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  ৮০০+ অনলাইন
                </span>
              </div>
              <p className="text-xs sm:text-sm text-muted-foreground">
                জমি পরিমাপ, মৌজা ম্যাপ ও খতিয়ান সংক্রান্ত প্রশ্নোত্তর ও উন্মুক্ত আলোচনা ফোরাম।
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-center">
              <AskQuestionModal
                customTrigger={
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground font-normal text-xs sm:text-sm hover:bg-primary/90 transition-colors shadow-xs cursor-pointer"
                  >
                    <MessageSquarePlus className="size-4" />
                    <span>প্রশ্ন জিজ্ঞাসা করুন</span>
                  </button>
                }
              />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Main Interactive Social Feed Grid ─────────────── */}
      <div className={`${CONTAINER_MAX_WIDTH} mx-auto px-4 py-6`}>
        <CommunityFeed />
      </div>
    </div>
  );
}
