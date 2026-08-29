"use client";

import { Badge } from "@/components/ui/badge";
import { BadgeCheck } from "lucide-react";
import { StarRating } from "@/components/common/star-rating";

import type {
  TSurveyorReview,
  TSurveyorServiceWithPrice,
} from "@/interface/surveyor-profile";
import { ReviewModal } from "./review-modal";

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
          <div className="mt-1 flex items-center gap-1.5">
            <StarRating rating={review.rating} size={13} />
            <span className="text-xs text-muted-foreground">
              — {review.serviceName}
            </span>
          </div>
        </div>
        {review.isVerifiedService && (
          <Badge variant="success" className="gap-1">
            <BadgeCheck className="size-3" />
            যাচাইকৃত কাজ
          </Badge>
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
  reviews,
  totalReviews,
  services,
}: {
  reviews?: TSurveyorReview[];
  totalReviews?: number;
  services?: TSurveyorServiceWithPrice[];
}) {
  const approvedReviews = (reviews ?? []).filter((r) => r.status === "approved");
  const pendingReviews = (reviews ?? []).filter((r) => r.status === "pending");

  return (
    <section>
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-semibold font-heading md:text-xl">
            ক্লায়েন্ট রিভিউ
          </h2>
          <span className="text-sm text-muted-foreground">
            ({totalReviews ?? 0} টি)
          </span>
        </div>
        {services && services.length > 0 && (
          <ReviewModal services={services} />
        )}
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
              <Badge variant="progress">
                ⏳ যাচাইয়ের অপেক্ষায়
              </Badge>
              <ReviewCard review={review} />
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
