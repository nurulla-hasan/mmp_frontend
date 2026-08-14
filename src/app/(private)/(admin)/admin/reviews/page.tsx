"use client";

import { useState } from "react";
import { Check, Clock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { SectionHeading } from "@/components/home/section-heading";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TSurveyorReview } from "@/types/surveyor-profile.type";

// ─── Mock pending reviews ─────────────────────────────────
const initialPendingReviews: (TSurveyorReview & { surveyorName: string; surveyorSlug: string })[] = [
  {
    id: "review-pending-001",
    reviewerName: "আনোয়ার হোসেন",
    rating: 4,
    comment: "ভালো কাজ করেছেন। তবে একটু দেরি করেছিলেন।",
    serviceName: "জমি পরিমাপ",
    createdAt: "2026-07-20T10:30:00.000Z",
    isVerifiedService: false,
    status: "pending",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
  {
    id: "review-pending-002",
    reviewerName: "শামীমা বেগম",
    rating: 3,
    comment: "মোটামুটি কাজ। আরও ভালো হতে পারে সীমানা নির্ধারণ।",
    serviceName: "সীমানা নির্ধারণ",
    createdAt: "2026-07-19T16:45:00.000Z",
    isVerifiedService: false,
    status: "pending",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
];

const initialApprovedReviews: (TSurveyorReview & { surveyorName: string; surveyorSlug: string })[] = [
  {
    id: "review-001",
    reviewerName: "রহিম উদ্দিন",
    rating: 5,
    comment: "সময়মতো এসে জমির পরিমাপ করেছেন এবং পুরো হিসাবটি সহজভাবে বুঝিয়ে দিয়েছেন।",
    serviceName: "জমি পরিমাপ",
    createdAt: "2026-06-18T14:20:00.000Z",
    isVerifiedService: true,
    status: "approved",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
  {
    id: "review-002",
    reviewerName: "মো. কামাল হোসেন",
    rating: 4,
    comment: "কাজ ভালো হয়েছে। সীমানার বিষয়গুলো পরিষ্কারভাবে দেখিয়ে দিয়েছেন।",
    serviceName: "সীমানা নির্ধারণ",
    createdAt: "2026-05-27T11:40:00.000Z",
    isVerifiedService: true,
    status: "approved",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
  {
    id: "review-003",
    reviewerName: "সাবিনা ইয়াসমিন",
    rating: 5,
    comment: "পারিবারিক জমি ভাগের হিসাব এবং রিপোর্ট সুন্দরভাবে তৈরি করে দিয়েছেন।",
    serviceName: "জমি ভাগ",
    createdAt: "2026-04-09T16:10:00.000Z",
    isVerifiedService: true,
    status: "approved",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
];

function ReviewStatusBadge({ status }: { status: string }) {
  if (status === "pending") {
    return (
      <Badge variant="outline" className="gap-1 text-amber-600 border-amber-300">
        <Clock className="size-3" /> বিচারাধীন
      </Badge>
    );
  }
  if (status === "approved") {
    return (
      <Badge variant="outline" className="gap-1 text-green-600 border-green-300">
        <Check className="size-3" /> অনুমোদিত
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="gap-1 text-destructive border-destructive/30">
      <X className="size-3" /> প্রত্যাখ্যাত
    </Badge>
  );
}

function ReviewRow({
  review,
  onApprove,
  onReject,
}: {
  review: TSurveyorReview & { surveyorName: string; surveyorSlug: string };
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-start sm:justify-between">
      <div className="flex-1 space-y-1.5">
        <div className="flex items-center gap-2">
          <p className="font-medium text-foreground">{review.reviewerName}</p>
          <ReviewStatusBadge status={review.status} />
        </div>
        <p className="text-xs text-muted-foreground">
          সার্ভেয়ার: {review.surveyorName} — {review.serviceName}
        </p>
        <div className="flex items-center gap-0.5">
          {Array.from({ length: 5 }, (_, i) => (
            <span
              key={i}
              className={`text-sm ${i < review.rating ? "text-amber-400" : "text-muted-foreground/30"}`}
            >
              ★
            </span>
          ))}
        </div>
        <p className="text-sm leading-relaxed text-muted-foreground">
          &quot;{review.comment}&quot;
        </p>
        <p className="text-xs text-muted-foreground">
          {new Date(review.createdAt).toLocaleDateString("bn-BD", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {review.status === "pending" && (
        <div className="flex shrink-0 gap-2">
          <Button
            size="sm"
            variant="outline"
            className="border-green-500 text-green-600 hover:bg-green-50 hover:text-green-700"
            onClick={() => onApprove(review.id)}
          >
            <Check className="size-4" />
            অনুমোদন
          </Button>
          <Button
            size="sm"
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10"
            onClick={() => onReject(review.id)}
          >
            <X className="size-4" />
            প্রত্যাখ্যান
          </Button>
        </div>
      )}
    </div>
  );
}

export default function AdminReviewsPage() {
  const [pendingReviews, setPendingReviews] = useState(initialPendingReviews);
  const [approvedReviews, setApprovedReviews] = useState(initialApprovedReviews);
  const [rejectedReviews, setRejectedReviews] = useState<
    (TSurveyorReview & { surveyorName: string; surveyorSlug: string })[]
  >([]);

  const handleApprove = (id: string) => {
    const review = pendingReviews.find((r) => r.id);
    if (!review) return;
    setPendingReviews((prev) => prev.filter((r) => r.id !== id));
    setApprovedReviews((prev) => [
      { ...review, status: "approved" as const },
      ...prev,
    ]);
    SuccessToast("রিভিউটি অনুমোদিত হয়েছে।");
  };

  const handleReject = (id: string) => {
    const review = pendingReviews.find((r) => r.id);
    if (!review) return;
    setPendingReviews((prev) => prev.filter((r) => r.id !== id));
    setRejectedReviews((prev) => [
      { ...review, status: "rejected" as const },
      ...prev,
    ]);
    ErrorToast("রিভিউটি প্রত্যাখ্যান করা হয়েছে।");
  };

  const hasAny = pendingReviews.length > 0 || approvedReviews.length > 0 || rejectedReviews.length > 0;

  if (!hasAny) {
    return (
      <div className="space-y-6">
        <SectionHeading
          title="মূল্যায়ন (রিভিউ) ব্যবস্থাপনা"
          description="সার্ভেয়ারদের রিভিউ যাচাই ও অনুমোদন করুন।"
          alignment="left"
        />
        <p className="text-sm text-muted-foreground">কোনো রিভিউ নেই।</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <SectionHeading
        title="মূল্যায়ন (রিভিউ) ব্যবস্থাপনা"
        description="সার্ভেয়ারদের রিভিউ যাচাই ও অনুমোদন করুন।"
        alignment="left"
      />

      {/* Pending */}
      {pendingReviews.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold font-heading">বিচারাধীন রিভিউ</h2>
            <span className="rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700 dark:bg-amber-900/30 dark:text-amber-400">
              {pendingReviews.length} টি
            </span>
          </div>
          <div className="space-y-3">
            {pendingReviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </section>
      )}

      {/* Approved History */}
      {approvedReviews.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold font-heading">অনুমোদিত রিভিউ</h2>
            <span className="rounded-full bg-green-100 px-2 py-0.5 text-xs font-medium text-green-700 dark:bg-green-900/30 dark:text-green-400">
              {approvedReviews.length} টি
            </span>
          </div>
          <div className="space-y-3">
            {approvedReviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </section>
      )}

      {/* Rejected History */}
      {rejectedReviews.length > 0 && (
        <section className="space-y-3">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold font-heading">প্রত্যাখ্যাত রিভিউ</h2>
            <span className="rounded-full bg-red-100 px-2 py-0.5 text-xs font-medium text-red-700 dark:bg-red-900/30 dark:text-red-400">
              {rejectedReviews.length} টি
            </span>
          </div>
          <div className="space-y-3">
            {rejectedReviews.map((review) => (
              <ReviewRow
                key={review.id}
                review={review}
                onApprove={handleApprove}
                onReject={handleReject}
              />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
