"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Check, Trash2, UserRound, X } from "lucide-react";
import Link from "next/link";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { StarRating } from "@/components/common/star-rating";
import {
  updateReviewStatusAction,
  deleteReviewAction,
} from "../_actions/review.action";
import { SuccessToast, ErrorToast, formatDate, getInitials } from "@/lib/utils";
import type { TReview } from "@/interface/review";

export type ReviewRow = TReview;

function ReviewActionsCell({ review }: { review: ReviewRow }) {
  const status = review.status;

  const handleApprove = async () => {
    try {
      const res = await updateReviewStatusAction(review.id, "APPROVED");
      if (res.success) {
        SuccessToast("Review approved successfully.");
      } else {
        ErrorToast(res.message || "Failed to approve review.");
      }
    } catch {
      ErrorToast("An error occurred while approving review.");
    }
  };

  const handleReject = async () => {
    try {
      const res = await updateReviewStatusAction(review.id, "REJECTED");
      if (res.success) {
        SuccessToast("Review rejected.");
      } else {
        ErrorToast(res.message || "Failed to reject review.");
      }
    } catch {
      ErrorToast("An error occurred while rejecting review.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteReviewAction(review.id);
      if (res.success) {
        SuccessToast("Review deleted successfully.");
      } else {
        ErrorToast(res.message || "Failed to delete review.");
      }
    } catch {
      ErrorToast("An error occurred while deleting review.");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* 1. Approve Button (if not already approved) */}
      {status !== "APPROVED" && (
        <ConfirmationModal
          title="Approve Review?"
          description={`Approving this review from "${review.reviewerName}" will make it publicly visible on the surveyor's profile.`}
          confirmText="Approve"
          cancelText="Cancel"
          loadingText="Approving..."
          onConfirm={handleApprove}
          actionTrigger={
            <Button
              variant="outline"
              size="icon"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
              aria-label="Approve review"
            >
              <Check />
            </Button>
          }
        />
      )}

      {/* 2. Reject Button (if not already rejected) */}
      {status !== "REJECTED" && (
        <ConfirmationModal
          title="Reject Review?"
          description="Rejecting this review will hide it from the surveyor's public profile."
          confirmText="Reject"
          cancelText="Cancel"
          loadingText="Rejecting..."
          variant="destructive"
          onConfirm={handleReject}
          actionTrigger={
            <Button
              variant="outline"
              size="icon"
              className="text-amber-600 hover:text-amber-700 hover:bg-amber-500/10"
              aria-label="Reject review"
            >
              <X />
            </Button>
          }
        />
      )}

      {/* 3. Delete Button */}
      <ConfirmationModal
        title="Delete Review?"
        description="Are you sure you want to permanently delete this review? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        onConfirm={handleDelete}
        actionTrigger={
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete review"
          >
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}

export const reviewColumns: ColumnDef<ReviewRow>[] = [
  {
    accessorKey: "reviewerName",
    header: "Reviewer",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <Avatar className="shrink-0">
          <AvatarImage
            src={row.original.user?.imageUrl}
            alt={row.original.reviewerName}
          />
          <AvatarFallback>
            {getInitials(row.original.reviewerName) || <UserRound />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-xs">
            {row.original.reviewerName}
          </span>
          {row.original.reviewerEmail && (
            <span className="text-xs text-muted-foreground font-mono truncate max-w-40">
              {row.original.reviewerEmail}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "surveyorProfile",
    header: "Surveyor",
    cell: ({ row }) => {
      const surveyor = row.original.surveyorProfile;
      const user = surveyor?.user;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="shrink-0">
            <AvatarImage src={user?.imageUrl} alt={user?.name || "Surveyor"} />
            <AvatarFallback>
              {getInitials(user?.name || "") || <UserRound />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            {surveyor?.slug ? (
              <Link
                href={`/surveyors/${surveyor.slug}`}
                target="_blank"
                className="font-semibold text-foreground text-xs hover:text-primary hover:underline truncate max-w-36"
              >
                {user?.name || "Surveyor"}
              </Link>
            ) : (
              <span className="font-semibold text-foreground text-xs">
                {user?.name || "Surveyor"}
              </span>
            )}
            {user?.district && (
              <span className="text-xs text-muted-foreground">
                {user.district}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "rating",
    header: "Rating",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5">
        <StarRating rating={row.original.rating} size={13} />
        <span className="text-xs font-bold text-foreground font-mono">
          {row.original.rating}.0
        </span>
      </div>
    ),
  },
  {
    accessorKey: "comment",
    header: "Feedback",
    cell: ({ row }) => {
      const comment = row.original.comment;
      const bracketMatch = comment.match(/^\[(.*?)\]\s*(.*)$/);
      const displayService =
        row.original.serviceName || (bracketMatch ? bracketMatch[1] : null);
      const displayComment = bracketMatch ? bracketMatch[2] : comment;

      return (
        <div className="flex flex-col gap-1 max-w-xs">
          {displayService && (
            <Badge variant="outline" className="w-fit font-normal">
              {displayService}
            </Badge>
          )}
          <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
            {displayComment}
          </p>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge
          variant={
            status === "APPROVED"
              ? "success"
              : status === "REJECTED"
                ? "rejected"
                : "pending"
          }
        >
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ReviewActionsCell review={row.original} />,
  },
];
