"use client";

import type { TAuthUser } from "@/interface/auth";
import type {
  TSurveyorReview,
  TSurveyorServiceWithPrice,
} from "@/interface/surveyor-profile";

import { ReviewCard } from "./review-card";
import { ReviewModal } from "./review-modal";

export function SurveyorReviews({
  surveyorProfileId,
  surveyorSlug,
  surveyorUserId,
  reviews,
  totalReviews,
  services,
  currentUser,
}: {
  surveyorProfileId?: string;
  surveyorSlug?: string;
  surveyorUserId?: string;
  reviews?: TSurveyorReview[];
  totalReviews?: number;
  services?: TSurveyorServiceWithPrice[];
  currentUser?: TAuthUser | null;
}) {
  const approvedReviews = (reviews ?? []).filter(
    (r) => r.status === "approved" || (r.status as string) === "APPROVED",
  );
  const pendingReviews = (reviews ?? []).filter(
    (r) => r.status === "pending" || (r.status as string) === "PENDING",
  );

  const isOwnProfile =
    !!currentUser && !!surveyorUserId && currentUser.id === surveyorUserId;

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
        {services && services.length > 0 && !isOwnProfile && (
          <ReviewModal
            surveyorProfileId={surveyorProfileId}
            surveyorSlug={surveyorSlug}
            services={services}
            currentUser={currentUser}
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

      {/* Pending Reviews (Fixed opacity-70 style, no hover change) */}
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
