"use client";

import { Badge } from "@/components/ui/badge";
import { BadgeCheck, Clock } from "lucide-react";
import { StarRating } from "@/components/common/star-rating";
import { cn } from "@/lib/utils";

import type {
  TSurveyorReview,
  TSurveyorServiceWithPrice,
} from "@/interface/surveyor-profile";
import { ReviewModal } from "./review-modal";

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
}

function ReviewCard({
  review,
  isPending = false,
}: {
  review: TSurveyorReview;
  isPending?: boolean;
}) {
  // If previous review had [serviceName] prepended in comment text, parse it cleanly
  const bracketMatch = review.comment.match(/^\[(.*?)\]\s*(.*)$/);
  const displayServiceName =
    review.serviceName || (bracketMatch ? bracketMatch[1] : undefined);
  const displayComment = bracketMatch ? bracketMatch[2] : review.comment;

  return (
    <div
      className={cn(
        "rounded-xl border p-4 transition-all",
        isPending
          ? "border-dashed border-amber-500/40 bg-amber-500/5 opacity-75 dark:bg-amber-950/15 dark:border-amber-500/30"
          : "border-border bg-card shadow-xs",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="flex items-center gap-2 justify-between">
            <p className="font-medium text-foreground">{review.reviewerName}</p>
            <div>
              {isPending && (
                <Badge variant="progress">
                  <Clock />
                  যাচাইয়ের অপেক্ষায়
                </Badge>
              )}
            </div>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <StarRating rating={review.rating} size={13} />
            {displayServiceName && (
              <span className="text-xs text-muted-foreground">
                — {displayServiceName}
              </span>
            )}
          </div>
        </div>
        {review.isVerifiedService && !isPending && (
          <Badge variant="success" className="gap-1">
            <BadgeCheck className="size-3" />
            যাচাইকৃত কাজ
          </Badge>
        )}
      </div>
      <p className="mt-2.5 leading-relaxed text-foreground/90 text-sm md:text-base">
        &quot;{displayComment}&quot;
      </p>
      <p className="mt-2 text-xs text-muted-foreground">
        {formatJoinDate(review.createdAt)}
      </p>
    </div>
  );
}

export function SurveyorReviews({
  surveyorProfileId,
  reviews,
  totalReviews,
  services,
}: {
  surveyorProfileId?: string;
  reviews?: TSurveyorReview[];
  totalReviews?: number;
  services?: TSurveyorServiceWithPrice[];
}) {
  const approvedReviews = (reviews ?? []).filter(
    (r) => r.status === "approved" || (r.status as string) === "APPROVED",
  );
  const pendingReviews = (reviews ?? []).filter(
    (r) => r.status === "pending" || (r.status as string) === "PENDING",
  );

  return (
    <section className="space-y-4">
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
          <ReviewModal
            surveyorProfileId={surveyorProfileId}
            services={services}
          />
        )}
      </div>

      {/* Approved Reviews List */}
      {approvedReviews.length > 0 ? (
        <div className="space-y-3">
          {approvedReviews.map((review) => (
            <ReviewCard key={review.id} review={review} />
          ))}
        </div>
      ) : pendingReviews.length === 0 ? (
        <p className="text-sm text-muted-foreground">এখনও কোনো রিভিউ নেই।</p>
      ) : null}

      {/* Pending Reviews (Dim light / translucent style) */}
      {pendingReviews.length > 0 && (
        <div className="space-y-3 pt-1">
          {pendingReviews.map((review) => (
            <ReviewCard key={review.id} review={review} isPending={true} />
          ))}
        </div>
      )}
    </section>
  );
}
