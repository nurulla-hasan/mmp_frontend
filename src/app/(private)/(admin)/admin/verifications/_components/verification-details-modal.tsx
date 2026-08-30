"use client";

import { useState } from "react";
import type { ReactNode } from "react";
import {
  ExternalLink,
  Eye,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  UserRound,
  Wrench,
  Check,
  X,
  Clock,
  FileCheck,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { verifySurveyorAction } from "../_actions/verification.action";
import { SuccessToast, ErrorToast, formatDate, getInitials } from "@/lib/utils";
import type { TVerificationRequest } from "@/interface/verification";
import { VerificationDecisionModal } from "./verification-decision-modal";

interface VerificationDetailsModalProps {
  request: TVerificationRequest;
  actionTrigger?: ReactNode;
}

export function VerificationDetailsModal({
  request,
  actionTrigger,
}: VerificationDetailsModalProps) {
  const [open, setOpen] = useState(false);
  const [isApproving, setIsApproving] = useState(false);
  const [showApproveConfirm, setShowApproveConfirm] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);

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
        setShowApproveConfirm(false);
        setOpen(false);
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
    <>
      <ModalWrapper
        open={open}
        onOpenChange={setOpen}
        title="Verification Application Details"
        description="Review applicant identity, surveying credentials, and service catalog."
        actionTrigger={
          actionTrigger || (
            <Button
              variant="outline"
              size="icon"
              className="size-8"
              aria-label="View verification details"
            >
              <Eye className="size-4" />
            </Button>
          )
        }
      >
        <div className="space-y-5 max-h-[72vh] overflow-y-auto pr-1">
          {/* 1. Header Profile Banner */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-muted/40 border">
            <div className="flex items-center gap-3.5">
              <Avatar className="size-12 sm:size-14 border-2 border-background shadow-xs shrink-0">
                <AvatarImage src={user?.imageUrl} alt={user?.name || "Surveyor"} />
                <AvatarFallback>
                  {getInitials(user?.name || "") || <UserRound className="size-6" />}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <h4 className="font-semibold text-foreground text-base">
                    {user?.name || "Anonymous Applicant"}
                  </h4>
                  {status === "APPROVED" && (
                    <ShieldCheck className="size-4 text-emerald-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {request.headline || "Professional Surveyor"}
                </p>
                <div className="flex flex-wrap items-center gap-x-3 gap-y-1 mt-1 text-xs text-muted-foreground">
                  {user?.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="size-3" />
                      {user.email}
                    </span>
                  )}
                  {user?.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="size-3" />
                      {user.phone}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <Badge
              variant={
                status === "APPROVED"
                  ? "success"
                  : status === "REJECTED"
                    ? "rejected"
                    : "pending"
              }
              size="lg"
            >
              {status}
            </Badge>
          </div>

          {/* 2. Professional Credentials & Certificate */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <Clock className="size-3.5 text-primary" />
                Experience
              </span>
              <p className="text-sm font-semibold text-foreground">
                {request.experienceYears || 0} Years Experience
              </p>
            </div>

            <div className="p-3.5 rounded-lg border bg-card space-y-1.5">
              <span className="text-xs text-muted-foreground font-medium flex items-center gap-1.5">
                <FileCheck className="size-3.5 text-primary" />
                Certificate / Document
              </span>
              {request.certificateUrl ? (
                <a
                  href={request.certificateUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                >
                  <span>View Attached Document</span>
                  <ExternalLink className="size-3.5" />
                </a>
              ) : (
                <p className="text-xs text-muted-foreground">No document uploaded</p>
              )}
            </div>
          </div>

          {/* 3. Applicant Bio */}
          {request.bio && (
            <div className="space-y-1.5 p-3.5 rounded-lg border bg-muted/20">
              <span className="text-xs text-muted-foreground font-medium">
                Professional Bio
              </span>
              <p className="text-xs text-foreground leading-relaxed whitespace-pre-line">
                {request.bio}
              </p>
            </div>
          )}

          {/* 4. Services Offered */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Offered Services & Pricing
            </span>
            {request.surveyorServices && request.surveyorServices.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {request.surveyorServices.map((item) => (
                  <div
                    key={item.id || item.serviceId}
                    className="flex items-center justify-between p-2.5 rounded-lg border bg-card text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <Wrench className="size-3.5 text-primary shrink-0" />
                      <span className="font-medium text-foreground">
                        {item.service?.name || "Land Service"}
                      </span>
                    </div>
                    <span className="font-semibold text-primary">
                      ৳{item.startingPrice}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No specific services configured.
              </p>
            )}
          </div>

          {/* 5. Service Areas */}
          <div className="space-y-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              Coverage Areas (Districts & Upazilas)
            </span>
            {request.serviceAreas && request.serviceAreas.length > 0 ? (
              <div className="space-y-2">
                {request.serviceAreas.map((area, idx) => (
                  <div
                    key={area.id || idx}
                    className="p-3 rounded-lg border bg-card space-y-1.5"
                  >
                    <div className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                      <MapPin className="size-3.5 text-primary" />
                      <span>{area.district}</span>
                    </div>
                    <div className="flex flex-wrap gap-1 pl-5">
                      {area.upazilas && area.upazilas.length > 0 ? (
                        area.upazilas.map((u) => (
                          <span
                            key={u}
                            className="inline-block text-[11px] bg-muted px-2 py-0.5 rounded text-muted-foreground border"
                          >
                            {u}
                          </span>
                        ))
                      ) : (
                        <span className="text-[11px] text-muted-foreground">
                          All Upazilas covered
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-muted-foreground">
                No service areas specified.
              </p>
            )}
          </div>

          {/* 6. Admin Decision Note if available */}
          {request.adminNote && (
            <div className="p-3.5 rounded-lg border bg-amber-500/10 border-amber-500/20 text-xs space-y-1">
              <span className="font-semibold text-amber-700 dark:text-amber-400">
                Admin Note:
              </span>
              <p className="text-foreground/90">{request.adminNote}</p>
            </div>
          )}

          {/* 7. Action Buttons inside Modal */}
          <div className="flex items-center justify-between pt-4 border-t gap-2">
            <div className="text-xs text-muted-foreground">
              Applied on {formatDate(request.createdAt || "")}
            </div>

            <div className="flex items-center gap-2">
              {status !== "APPROVED" && (
                <Button
                  size="sm"
                  onClick={() => setShowApproveConfirm(true)}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5"
                >
                  <Check className="size-4" />
                  <span>Approve Application</span>
                </Button>
              )}

              {status !== "REJECTED" && (
                <Button
                  size="sm"
                  variant="destructive"
                  onClick={() => setShowRejectModal(true)}
                  className="gap-1.5"
                >
                  <X className="size-4" />
                  <span>Reject Application</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      </ModalWrapper>

      {/* Confirmation Modal for Approval */}
      <ConfirmationModal
        open={showApproveConfirm}
        onOpenChange={setShowApproveConfirm}
        title="Approve Surveyor Application?"
        description={`Approving "${user?.name}" will grant them SURVEYOR platform privileges and publish their profile to the public directory.`}
        confirmText="Approve Surveyor"
        cancelText="Cancel"
        loadingText="Approving..."
        isLoading={isApproving}
        onConfirm={handleApprove}
      />

      {/* Decision Modal for Rejection with Reason */}
      {user?.id && (
        <VerificationDecisionModal
          userId={user.id}
          userName={user.name}
          open={showRejectModal}
          onOpenChange={setShowRejectModal}
          onSuccess={() => {
            setShowRejectModal(false);
            setOpen(false);
          }}
        />
      )}
    </>
  );
}

