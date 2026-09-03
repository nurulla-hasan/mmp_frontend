"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  ExternalLink,
  FileCheck,
  FileX,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  X,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { VerificationDetailsModal } from "./verification-details-modal";
import { VerificationDecisionModal } from "./verification-decision-modal";
import { verifySurveyorAction } from "../_actions/verification.action";
import { SuccessToast, ErrorToast, formatDate, getInitials } from "@/lib/utils";
import type { TVerificationRequest } from "@/interface/verification";

export type VerificationRow = TVerificationRequest;

function VerificationActionsCell({ request }: { request: VerificationRow }) {
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [isApproving, setIsApproving] = useState(false);

  const user = request.user;
  const status = request.verificationStatus || "PENDING";

  const handleApprove = async () => {
    if (!user?.id) return;
    setIsApproving(true);
    try {
      const res = await verifySurveyorAction(user.id, {
        status: "APPROVED",
        adminNote: "Application verified and approved by admin.",
      });
      if (res.success) {
        SuccessToast(`Surveyor "${user.name}" approved successfully.`);
      } else {
        ErrorToast(res.message || "Failed to approve application.");
      }
    } catch {
      ErrorToast("An error occurred during approval.");
    } finally {
      setIsApproving(false);
    }
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      {/* 1. View Details Modal */}
      <VerificationDetailsModal request={request} />

      {/* 2. Quick Approve Button (if not already approved) */}
      {status !== "APPROVED" && (
        <ConfirmationModal
          title="Approve Surveyor?"
          description={`Approving "${user?.name}" will grant them SURVEYOR role and publish their profile.`}
          confirmText="Approve"
          cancelText="Cancel"
          loadingText="Approving..."
          isLoading={isApproving}
          onConfirm={handleApprove}
          actionTrigger={
            <Button
              variant="outline"
              size="icon"
              className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
              aria-label="Approve application"
            >
              <Check />
            </Button>
          }
        />
      )}

      {/* 3. Quick Reject Button (if not already rejected) */}
      {status !== "REJECTED" && (
        <>
          <Button
            variant="destructive"
            size="icon"
            onClick={() => setShowRejectModal(true)}
            aria-label="Reject application"
          >
            <X />
          </Button>

          {user?.id && (
            <VerificationDecisionModal
              userId={user.id}
              userName={user.name}
              open={showRejectModal}
              onOpenChange={setShowRejectModal}
            />
          )}
        </>
      )}
    </div>
  );
}

export const verificationColumns: ColumnDef<VerificationRow>[] = [
  {
    accessorKey: "user.name",
    header: "Applicant",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="shrink-0">
            <AvatarImage src={user?.imageUrl} alt={user?.name || "Applicant"} />
            <AvatarFallback>
              {getInitials(user?.name || "") || <UserRound />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="font-semibold text-foreground text-xs">
                {user?.name || "Anonymous"}
              </span>
              {row.original.verificationStatus === "APPROVED" && (
                <ShieldCheck className="size-3 text-emerald-600" />
              )}
            </div>
            {user?.phone && (
              <span className="flex items-center gap-1 text-xs text-muted-foreground">
                <Phone className="size-2.5" />
                {user.phone}
              </span>
            )}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "headline",
    header: "Headline & Experience",
    cell: ({ row }) => (
      <div className="flex flex-col max-w-48">
        <span className="text-xs font-medium text-foreground truncate">
          {row.original.headline || "Land Surveyor"}
        </span>
        <span className="text-xs text-muted-foreground">
          {row.original.experienceYears || 0} yrs experience
        </span>
      </div>
    ),
  },
  {
    accessorKey: "location",
    header: "Location",
    cell: ({ row }) => {
      const user = row.original.user;
      return (
        <div className="flex items-center gap-1 text-xs text-muted-foreground">
          <MapPin className="size-3 shrink-0 text-primary" />
          <span className="truncate max-w-36">
            {user?.district ? `${user.district}${user.upazila ? `, ${user.upazila}` : ""}` : "Unspecified"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "certificateUrl",
    header: "Document",
    cell: ({ row }) => {
      const url = row.original.certificateUrl;
      if (!url) {
        return (
          <span className="flex items-center gap-1 text-xs text-muted-foreground">
            <FileX className="size-3" />
            None
          </span>
        );
      }
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
        >
          <FileCheck className="size-3" />
          <span>Attached</span>
          <ExternalLink className="size-2.5" />
        </a>
      );
    },
  },
  {
    accessorKey: "verificationStatus",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.verificationStatus || "PENDING";
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
    header: "Applied Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {formatDate(row.original.createdAt || "")}
      </span>
    ),
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <VerificationActionsCell request={row.original} />,
  },
];
