"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CreditCard,
  ShieldAlert,
  Star,
  UserPlus,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";

export interface ActivityRow {
  id: string;
  type: "USER_SIGNUP" | "VERIFICATION_REQUEST" | "REVIEW_SUBMITTED" | "SUBSCRIPTION_CREATED";
  title: string;
  description: string;
  user?: {
    name: string;
    email: string;
    imageUrl?: string;
  };
  status?: string;
  createdAt: string;
}

function renderEventTypeBadge(type: ActivityRow["type"]) {
  switch (type) {
    case "SUBSCRIPTION_CREATED":
      return (
        <Badge variant="progress">
          <CreditCard />
          Payment
        </Badge>
      );
    case "VERIFICATION_REQUEST":
      return (
        <Badge variant="pending">
          <ShieldAlert />
          Verification
        </Badge>
      );
    case "REVIEW_SUBMITTED":
      return (
        <Badge variant="info">
          <Star />
          Review
        </Badge>
      );
    case "USER_SIGNUP":
    default:
      return (
        <Badge variant="outline">
          <UserPlus />
          Signup
        </Badge>
      );
  }
}

export const activityColumns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: "type",
    header: "Event",
    cell: ({ row }) => renderEventTypeBadge(row.original.type),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => {
      const user = row.original.user;
      if (!user) return <span className="text-xs text-muted-foreground">—</span>;

      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="shrink-0">
            <AvatarImage src={user.imageUrl} alt={user.name} />
            <AvatarFallback>
              {getInitials(user.name) || <UserRound />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-xs">
              {user.name}
            </span>
            {user.email && (
              <span className="text-xs text-muted-foreground font-mono truncate max-w-40">
                {user.email}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "description",
    header: "Activity Details",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5 max-w-xs">
        <span className="font-medium text-foreground text-xs">
          {row.original.title}
        </span>
        <span className="text-xs text-muted-foreground line-clamp-1">
          {row.original.description}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      if (!status) return <span className="text-xs text-muted-foreground">—</span>;

      return (
        <Badge
          variant={
            status === "ACTIVE" || status === "APPROVED"
              ? "active"
              : status === "BLOCKED" || status === "REJECTED"
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
    header: "Time",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
];
