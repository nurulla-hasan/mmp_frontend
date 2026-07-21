"use client";

import { useState } from "react";
import { BadgeCheck, Star } from "lucide-react";

import type { TSurveyorReview, TSurveyorServiceWithPrice } from "@/types/surveyor-profile.type";
import { SuccessToast } from "@/lib/utils";
import { ReviewForm } from "@/components/surveyors/review-form";

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
  });
}

function ReviewCard({ review }: { review: TSurveyorReview }) {
  return (
    <div className="rounded-xl border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-medium text-foreground">{review.reviewerName}</p>
          <div className="mt-0.5 flex items-center gap-1.5">
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 5 }, (_, i) => (
                <Star
                  key={i}
                  className={`size-3.5 ${i < review.rating ? "fill-amber-400 text-amber-400" : "text-muted-foreground/30"}`}
                />
              ))}
            </div>
            <span className="text-xs text-muted-foreground">
              — {review.serviceName}
            </span>
          </div>
        </div>
        {review.isVerifiedService && (
          <span className="flex items-center gap-1" title="এই রিভিউটি যাচাইকৃত কাজের">
            <BadgeCheck className="size-4 text-primary" />
            <span className="text-xs text-muted-foreground">যাচাইকৃত কাজ</span>
          </span>
        )}
      </div>
      <p className="mt-2 leading-relaxed text-muted-foreground md:text-base">
        &quot;{review.comment}&quot;
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatJoinDate(review.createdAt)}
      </p>
    </div>
  );
}

export function SurveyorReviews({
  reviews: initialReviews,
  totalReviews,
  services,
}: {
  reviews: TSurveyorReview[];
  totalReviews: number;
  services?: TSurveyorServiceWithPrice[];
}) {
  const [reviews, setReviews] = useState(initialReviews);
  const approvedReviews = reviews.filter((r) => r.status === "approved");
  const pendingReviews = reviews.filter((r) => r.status === "pending");

  const handleReviewSubmit = (data: {
    reviewerName: string;
    rating: number;
    comment: string;
    serviceName: string;
  }) => {
    const newReview: TSurveyorReview = {
      id: `review-${Date.now()}`,
      reviewerName: data.reviewerName,
      rating: data.rating,
      comment: data.comment,
      serviceName: data.serviceName,
      createdAt: new Date().toISOString(),
      isVerifiedService: false,
      status: "pending",
    };
    setReviews((prev) => [newReview, ...prev]);
    SuccessToast("আপনার রিভিউ জমা দেওয়া হয়েছে। এডমিন যাচাইয়ের পর প্রকাশ করা হবে।");
  };

  return (
    <section>
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold font-heading md:text-xl">
          ক্লায়েন্ট রিভিউ
        </h2>
        <span className="text-sm text-muted-foreground">
          {totalReviews} টি
        </span>
      </div>

      {approvedReviews.length > 0 ? (
        <div className="mt-4 space-y-3">
          {approvedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : (
        <p className="mt-4 text-sm text-muted-foreground">
          এখনও কোনো রিভিউ নেই।
        </p>
      )}

      {pendingReviews.length > 0 && (
        <div className="mt-3 space-y-2">
          {pendingReviews.map((review) => (
            <div
              key={review.id}
              className="rounded-xl border border-dashed border-muted-foreground/30 bg-muted/30 p-4 opacity-60 space-y-2"
            >
              <p className="text-xs text-muted-foreground">
                ⏳ আপনার জমা দেওয়া রিভিউটি যাচাইয়ের অপেক্ষায় আছে
              </p>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}

      {services && services.length > 0 && (
        <div className="mt-6">
          <ReviewForm services={services} onSubmit={handleReviewSubmit} />
        </div>
      )}
    </section>
  );
}
