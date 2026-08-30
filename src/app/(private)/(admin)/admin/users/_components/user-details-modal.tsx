"use client";

import type { ReactNode } from "react";
import {
  Mail,
  Phone,
  MessageSquare,
  MapPin,
  Calendar,
  Layers,
  Calculator,
  CheckCircle2,
  XCircle,
  Sparkles,
  UserRound,
} from "lucide-react";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { formatDate, getInitials } from "@/lib/utils";
import type { TUser } from "@/interface/user";

interface UserDetailsModalProps {
  user: TUser;
  actionTrigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

export function UserDetailsModal({
  user,
  actionTrigger,
  open,
  onOpenChange,
}: UserDetailsModalProps) {
  const roleVariant =
    user.role === "SURVEYOR"
      ? "info"
      : user.role === "ADMIN"
        ? "admin"
        : "default";

  return (
    <ModalWrapper
      open={open}
      onOpenChange={onOpenChange}
      actionTrigger={actionTrigger}
      title="User Profile Details"
      description="Overview of user account, contact information, and platform statistics."
      showClose={true}
    >
      <div className="space-y-6">
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4 p-4 rounded-xl bg-muted/40 border">
          <Avatar className="size-16 sm:size-20 border-2 border-primary/20">
            <AvatarImage src={user.imageUrl || undefined} alt={user.name} />
            <AvatarFallback className="text-lg">
              {getInitials(user.name) || <UserRound className="size-8" />}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1.5 text-center sm:text-left flex-1 min-w-0">
            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
              <h4 className="text-lg font-semibold text-foreground truncate">
                {user.name}
              </h4>
              <Badge variant={roleVariant}>{user.role}</Badge>
              <Badge variant={user.status === "ACTIVE" ? "active" : "blocked"}>
                {user.status}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground flex items-center justify-center sm:justify-start gap-1.5 font-mono">
              <Mail className="size-3.5" />
              <span>{user.email}</span>
            </p>
          </div>
        </div>

        {/* Contact & Location Details */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Contact & Address Information
          </h5>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3 rounded-lg border bg-card flex items-start gap-3">
              <Phone className="size-4 text-primary mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="text-muted-foreground block">Phone Number</span>
                <span className="font-medium text-foreground">
                  {user.phone || "Not provided"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card flex items-start gap-3">
              <MessageSquare className="size-4 text-emerald-500 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="text-muted-foreground block">WhatsApp Number</span>
                <span className="font-medium text-foreground">
                  {user.whatsappNumber || "Not provided"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card flex items-start gap-3">
              <MapPin className="size-4 text-rose-500 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="text-muted-foreground block">District & Upazila</span>
                <span className="font-medium text-foreground">
                  {user.district || user.upazila
                    ? `${user.upazila ? user.upazila + ", " : ""}${user.district || ""}`
                    : "Not specified"}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-lg border bg-card flex items-start gap-3">
              <Calendar className="size-4 text-sky-500 mt-0.5" />
              <div className="space-y-0.5 text-xs">
                <span className="text-muted-foreground block">Registration Date</span>
                <span className="font-medium text-foreground">
                  {formatDate(user.createdAt)}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Activity & Stats */}
        <div className="space-y-2">
          <h5 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Measurement & Account Statistics
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Layers className="size-3.5 text-primary" />
                <span>Plots Measured</span>
              </div>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {user.plotsMeasured || 0}
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Calculator className="size-3.5 text-primary" />
                <span>Saved Calculations</span>
              </div>
              <p className="text-xl font-bold text-foreground tabular-nums">
                {user.calculationsSaved || 0}
              </p>
            </div>

            <div className="p-3 rounded-lg border bg-muted/20 space-y-1 col-span-2 sm:col-span-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Sparkles className="size-3.5 text-amber-500" />
                <span>Subscription</span>
              </div>
              <p className="text-sm font-semibold text-foreground">
                {user.isSubscribed ? (
                  <span className="text-amber-500">Premium Pro</span>
                ) : (
                  "Free Plan"
                )}
              </p>
            </div>
          </div>
        </div>

        {/* Verification Status Banner */}
        <div className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 text-xs">
          <span className="text-muted-foreground">Email Verification Status</span>
          <div className="flex items-center gap-1.5 font-medium">
            {user.emailVerified ? (
              <>
                <CheckCircle2 className="size-4 text-emerald-500" />
                <span className="text-emerald-600 dark:text-emerald-400">Verified</span>
              </>
            ) : (
              <>
                <XCircle className="size-4 text-muted-foreground" />
                <span className="text-muted-foreground">Unverified</span>
              </>
            )}
          </div>
        </div>
      </div>
    </ModalWrapper>
  );
}
