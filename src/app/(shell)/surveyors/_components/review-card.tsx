"use client";

import { memo } from "react";

import { BadgeCheck, Clock } from "lucide-react";

import { StarRating } from "@/components/common/star-rating";
import { Badge } from "@/components/ui/badge";
import type { TSurveyorReview } from "@/interface/surveyor-profile";
import { cn } from "@/lib/utils";

interface ReviewCardProps {
  review: TSurveyorReview;
  isPending?: boolean;
}

function formatJoinDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("bn-BD", {
    month: "long",
    year: "numeric",
    day: "numeric",
  });
}

export const ReviewCard = memo(function ReviewCard({
  review,
  isPending = false,
}: ReviewCardProps) {
  const bracketMatch = review.comment.match(/^\[(.*?)\]\s*(.*)$/);
  const displayServiceName =
    review.serviceName || (bracketMatch ? bracketMatch[1] : undefined);
  const displayComment = bracketMatch ? bracketMatch[2] : review.comment;

  return (
    <div
      className={cn(
        "rounded-xl border p-4",
        isPending
          ? "border-dashed border-border/70 bg-muted/15 opacity-70 dark:bg-muted/10 dark:border-border/50"
          : "border-border bg-card shadow-xs",
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="w-full">
          <div className="flex items-center gap-2 justify-between">
            <p
              className={cn(
                "font-medium",
                isPending ? "text-muted-foreground" : "text-foreground",
              )}
            >
              {review.reviewerName}
            </p>
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
            <StarRating
              rating={review.rating}
              size={13}
              className={isPending ? "opacity-75" : ""}
            />
            {displayServiceName && (
              <span className="text-xs text-muted-foreground">
                — {displayServiceName}
              </span>
            )}
          </div>
        </div>
        {review.isVerifiedService && !isPending && (
          <Badge variant="success">
            <BadgeCheck />
            যাচাইকৃত কাজ
          </Badge>
        )}
      </div>
      <p
        className={cn(
          "mt-2.5 leading-relaxed text-sm md:text-base",
          isPending ? "text-muted-foreground/90 italic" : "text-foreground/90",
        )}
      >
        &quot;{displayComment}&quot;
      </p>
      <p className="mt-2 text-xs text-muted-foreground/70">
        {formatJoinDate(review.createdAt)}
      </p>
    </div>
  );
});
