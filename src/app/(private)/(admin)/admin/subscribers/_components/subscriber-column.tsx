"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2, Clock, Phone, UserRound, XCircle } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { ManageSubscriptionModal } from "./manage-subscription-modal";
import {
  approveSubscriptionAction,
  rejectSubscriptionAction,
} from "../_actions/subscriber.action";
import { formatDate, getInitials, SuccessToast, ErrorToast } from "@/lib/utils";
import type { TSubscriber } from "@/interface/subscriber";

export type SubscriberRow = TSubscriber;

function getDaysRemaining(endDateStr: string): {
  text: string;
  isExpired: boolean;
} {
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

function SubscriberActionsCell({ subscriber }: { subscriber: SubscriberRow }) {
  const [isProcessing, setIsProcessing] = useState(false);

  const handleApprove = async () => {
    setIsProcessing(true);
    try {
      const res = await approveSubscriptionAction(
        subscriber.id,
        "Approved by Admin",
      );
      if (res.success) {
        SuccessToast(`Subscription for "${subscriber.user.name}" approved successfully!`);
      } else {
        ErrorToast(res.message || "Failed to approve subscription.");
      }
    } catch {
      ErrorToast("An error occurred while approving subscription.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleReject = async () => {
    setIsProcessing(true);
    try {
      const res = await rejectSubscriptionAction(
        subscriber.id,
        "Payment details could not be verified",
      );
      if (res.success) {
        SuccessToast(`Subscription request rejected.`);
      } else {
        ErrorToast(res.message || "Failed to reject subscription.");
      }
    } catch {
      ErrorToast("An error occurred while rejecting subscription.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {subscriber.status === "PENDING" && (
        <>
          {/* Quick Approve Modal */}
          <ConfirmationModal
            title={`Approve Pro Subscription for "${subscriber.user.name}"?`}
            description={`This will activate the ${subscriber.plan.name} (${subscriber.plan.durationDays} days) package for this user immediately.`}
            confirmText="Approve & Activate"
            cancelText="Cancel"
            loadingText="Approving..."
            variant="default"
            onConfirm={handleApprove}
            actionTrigger={
              <Button
                variant="default"
                size="sm"
                className="h-8 px-2.5 bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer"
                disabled={isProcessing}
              >
                <CheckCircle2 className="size-3.5 mr-1" />
                Approve
              </Button>
            }
          />

          {/* Quick Reject Modal */}
          <ConfirmationModal
            title={`Reject Subscription Request?`}
            description={`Are you sure you want to reject this payment request for "${subscriber.user.name}"?`}
            confirmText="Reject Request"
            cancelText="Cancel"
            loadingText="Rejecting..."
            variant="destructive"
            onConfirm={handleReject}
            actionTrigger={
              <Button
                variant="outline"
                size="sm"
                className="h-8 px-2 text-destructive hover:bg-destructive/10 cursor-pointer"
                disabled={isProcessing}
              >
                <XCircle className="size-3.5 mr-1" />
                Reject
              </Button>
            }
          />
        </>
      )}

      {/* Edit / Detail Modal */}
      <ManageSubscriptionModal subscriber={subscriber} />
    </div>
  );
}

export const subscriberColumns: ColumnDef<SubscriberRow>[] = [
  {
    accessorKey: "user",
    header: "Subscriber",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar isPro={row.original.status === "ACTIVE"} className="shrink-0">
            <AvatarImage
              src={user?.imageUrl}
              alt={user?.name || "Subscriber"}
            />
            <AvatarFallback>
              {getInitials(user?.name || "") || (
                <UserRound className="size-3.5" />
              )}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-xs">
              {user?.name || "User"}
            </span>
            {user?.phone ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
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
    header: "Plan & Amount",
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
            <span className="text-xs text-primary font-bold">
              ৳{row.original.amountPaid}
            </span>
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "paymentMethod",
    header: "Payment Details",
    cell: ({ row }) => {
      const sub = row.original;
      return (
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-1.5">
            <Badge variant="outline" className="text-[10px] py-0 font-bold uppercase">
              {sub.paymentMethod || "MANUAL"}
            </Badge>
          </div>
          {sub.transactionId && (
            <div className="flex items-center gap-1 mt-0.5 font-mono text-[11px] text-foreground font-medium">
              <span className="text-muted-foreground">Trx:</span>
              <span className="text-primary font-bold">{sub.transactionId}</span>
            </div>
          )}
          {sub.senderPhone && (
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <span>From:</span>
              <span>{sub.senderPhone}</span>
            </div>
          )}
        </div>
      );
    },
  },
  {
    accessorKey: "endDate",
    header: "Validity",
    cell: ({ row }) => {
      const isPending = row.original.status === "PENDING";
      if (isPending) {
        return (
          <span className="text-xs text-amber-600 dark:text-amber-400 font-medium">
            Pending Approval
          </span>
        );
      }
      const { text, isExpired } = getDaysRemaining(row.original.endDate);
      return (
        <div className="flex flex-col gap-0.5">
          <span className="text-xs font-medium text-foreground">
            {formatDate(row.original.endDate)}
          </span>
          <span
            className={`text-xs flex items-center gap-1 ${
              isExpired
                ? "text-destructive font-medium"
                : "text-muted-foreground"
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
              ? "active"
              : status === "PENDING"
                ? "pending"
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
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <SubscriberActionsCell subscriber={row.original} />,
  },
];
