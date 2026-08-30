"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Clock, Phone, UserRound } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ManageSubscriptionModal } from "./manage-subscription-modal";
import { formatDate, getInitials } from "@/lib/utils";
import type { TSubscriber } from "@/interface/subscriber";

export type SubscriberRow = TSubscriber;

function getDaysRemaining(endDateStr: string): { text: string; isExpired: boolean } {
  const now = new Date().getTime();
  const end = new Date(endDateStr).getTime();
  const diffDays = Math.ceil((end - now) / (1000 * 60 * 60 * 24));

  if (diffDays <= 0) {
    return { text: "Expired", isExpired: true };
  }
  if (diffDays === 1) {
    return { text: "Expires tomorrow", isExpired: false };
  }
  return { text: `${diffDays} days left`, isExpired: false };
}

export const subscriberColumns: ColumnDef<SubscriberRow>[] = [
  {
    accessorKey: "user",
    header: "Subscriber",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="size-8 shrink-0 border border-border">
            <AvatarImage src={user?.imageUrl} alt={user?.name || "Subscriber"} />
            <AvatarFallback>
              {getInitials(user?.name || "") || <UserRound className="size-3.5" />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-xs">
                {user?.name || "User"}
              </span>
              <Badge variant="progress" size="sm" className="text-xs py-0 font-normal">
                {user?.role || "USER"}
              </Badge>
            </div>
            {user?.phone ? (
              <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                <Phone className="size-2.5" />
                {user.phone}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.user?.email || "—"}
      </span>
    ),
  },
  {
    accessorKey: "plan",
    header: "Active Plan",
    cell: ({ row }) => {
      const plan = row.original.plan;
      return (
        <div className="flex flex-col gap-0.5">
          <span className="font-semibold text-foreground text-xs">
            {plan?.name || "Pro Plan"}
          </span>
          <div className="flex items-center gap-1.5">
            <code className="text-xs text-muted-foreground font-mono">
              {plan?.code || "pro"}
            </code>
            <span className="text-[11px] text-primary font-medium">
              ৳{row.original.amountPaid}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Expires At",
    cell: ({ row }) => {
      const { text, isExpired } = getDaysRemaining(row.original.endDate);
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground">
            {formatDate(row.original.endDate)}
          </span>
          <span
            className={`text-[11px] flex items-center gap-1 ${
              isExpired ? "text-destructive font-medium" : "text-muted-foreground"
            }`}
          >
            <Clock className="size-2.5" />
            {text}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isExpired = new Date(row.original.endDate) < new Date();
      return (
        <Badge
          variant={
            status === "ACTIVE" && !isExpired
              ? "success"
              : status === "CANCELLED"
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
    accessorKey: "paymentMethod",
    header: "Payment",
    cell: ({ row }) => (
      <div className="flex flex-col text-[11px] text-muted-foreground">
        <span className="font-medium text-foreground uppercase">
          {row.original.paymentMethod || "MANUAL"}
        </span>
        {row.original.transactionId && (
          <span className="font-mono text-xs truncate max-w-25">
            {row.original.transactionId}
          </span>
        )}
      </div>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => (
      <div className="flex items-center">
        <ManageSubscriptionModal subscriber={row.original} />
      </div>
    ),
  },
];
