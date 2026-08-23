"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { StarRating } from "@/components/common/star-rating";

export type ReviewStatus = "approved" | "pending" | "rejected";

export interface ReviewRow {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  serviceName: string;
  createdAt: string;
  isVerifiedService: boolean;
  status: ReviewStatus;
  surveyorName: string;
  surveyorSlug: string;
}

const statusBadgeVariant: Record<
  ReviewStatus,
  "success" | "pending" | "rejected"
> = {
  approved: "success",
  pending: "pending",
  rejected: "rejected",
};

export const reviewColumns: ColumnDef<ReviewRow>[] = [
  {
    accessorKey: "reviewerName",
    header: "রিভিউয়ার",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.original.reviewerName}
      </div>
    ),
  },
  {
    accessorKey: "rating",
    header: "রেটিং",
    cell: ({ row }) => <StarRating rating={row.original.rating} />,
  },
  {
    accessorKey: "comment",
    header: "মন্তব্য",
    cell: ({ row }) => (
      <p className="max-w-xs truncate text-sm text-muted-foreground">
        {row.original.comment}
      </p>
    ),
  },
  {
    accessorKey: "serviceName",
    header: "সার্ভিস",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.serviceName}</span>
    ),
  },
  {
    accessorKey: "surveyorName",
    header: "সার্ভেয়ার",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.surveyorName}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "স্ট্যাটাস",
    cell: ({ row }) => {
      const status = row.original.status;
      return (
        <Badge variant={statusBadgeVariant[status]}>{status}</Badge>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "তারিখ",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.createdAt).toLocaleDateString("bn-BD")}
      </span>
    ),
  },
];
