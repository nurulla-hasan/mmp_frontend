"use client";

import { useState, useTransition } from "react";
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  Clock,
  Sparkles,
  UserRound,
  XCircle,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ModalWrapper } from "@/components/common/modal-wrapper";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import {
  extendSubscriptionAction,
  revokeSubscriptionAction,
  updateSubscriptionAction,
} from "../_actions/subscriber.action";
import { SuccessToast, ErrorToast, formatDate, getInitials } from "@/lib/utils";
import type { TSubscriber } from "@/interface/subscriber";

interface ManageSubscriptionModalProps {
  subscriber: TSubscriber;
  trigger?: React.ReactNode;
}

const EXTENSION_PRESETS = [
  { label: "+30 Days (1 Mo)", days: 30 },
  { label: "+90 Days (3 Mo)", days: 90 },
  { label: "+180 Days (6 Mo)", days: 180 },
  { label: "+365 Days (1 Yr)", days: 365 },
];

const MONTH_NAMES = [
  "January",
  "February",
  "March",
  "April",
  "May",
  "June",
  "July",
  "August",
  "September",
  "October",
  "November",
  "December",
];

const YEARS = Array.from({ length: 10 }, (_, i) => String(2025 + i)); // 2025 to 2034

export function ManageSubscriptionModal({
  subscriber,
  trigger,
}: ManageSubscriptionModalProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const user = subscriber.user;
  const plan = subscriber.plan;
  const isExpired = new Date(subscriber.endDate) < new Date();
  const isActive = subscriber.status === "ACTIVE" && !isExpired;

  // Selected date components
  const existingDate = subscriber.endDate
    ? new Date(subscriber.endDate)
    : new Date();

  const [selectedYear, setSelectedYear] = useState<string>(
    String(existingDate.getFullYear()),
  );
  const [selectedMonth, setSelectedMonth] = useState<string>(
    String(existingDate.getMonth()),
  );
  const [selectedDay, setSelectedDay] = useState<string>(
    String(existingDate.getDate()),
  );

  // Calculate days in selected month and year
  const daysInMonth = new Date(
    Number(selectedYear),
    Number(selectedMonth) + 1,
    0,
  ).getDate();

  const daysList = Array.from({ length: daysInMonth }, (_, i) => String(i + 1));

  // Current computed date
  const computedDate = new Date(
    Number(selectedYear),
    Number(selectedMonth),
    Math.min(Number(selectedDay), daysInMonth),
    23,
    59,
    59,
  );

  const handleExtend = (days: number) => {
    startTransition(async () => {
      try {
        const res = await extendSubscriptionAction(subscriber.id, days);
        if (res.success) {
          SuccessToast(
            `Subscription extended by ${days} days for ${user.name}.`,
          );
          setOpen(false);
        } else {
          ErrorToast(res.message || "Failed to extend subscription.");
        }
      } catch {
        ErrorToast("An error occurred while extending subscription.");
      }
    });
  };

  const handleSetPromo2028 = () => {
    startTransition(async () => {
      try {
        const promoDate = new Date("2028-12-31T23:59:59.999Z");
        const res = await updateSubscriptionAction(subscriber.id, {
          endDate: promoDate.toISOString(),
          status: "ACTIVE",
          adminNote: "Set to 2028 Promotional Free Pro campaign",
        });
        if (res.success) {
          SuccessToast(`Subscription updated until Dec 31, 2028 for ${user.name}.`);
          setOpen(false);
        } else {
          ErrorToast(res.message || "Failed to update subscription.");
        }
      } catch {
        ErrorToast("An error occurred while updating subscription.");
      }
    });
  };

  const handleCustomDateSubmit = () => {
    startTransition(async () => {
      try {
        const res = await updateSubscriptionAction(subscriber.id, {
          endDate: computedDate.toISOString(),
          status: "ACTIVE",
        });
        if (res.success) {
          SuccessToast(`Subscription expiry date updated for ${user.name}.`);
          setOpen(false);
        } else {
          ErrorToast(res.message || "Failed to update expiry date.");
        }
      } catch {
        ErrorToast("An error occurred while updating expiry date.");
      }
    });
  };

  const handleRevoke = async () => {
    try {
      const res = await revokeSubscriptionAction(subscriber.id);
      if (res.success) {
        SuccessToast(`Subscription revoked for ${user.name}.`);
        setOpen(false);
      } else {
        ErrorToast(res.message || "Failed to revoke subscription.");
      }
    } catch {
      ErrorToast("An error occurred while revoking subscription.");
    }
  };

  return (
    <ModalWrapper
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (next && subscriber.endDate) {
          const d = new Date(subscriber.endDate);
          setSelectedYear(String(d.getFullYear()));
          setSelectedMonth(String(d.getMonth()));
          setSelectedDay(String(d.getDate()));
        }
      }}
      title="Manage Subscription"
      description={`Update plan validity, extend duration, or revoke subscription for ${user.name}.`}
      actionTrigger={
        trigger ? (
          trigger
        ) : (
          <Button variant="outline">
            Manage Plan
          </Button>
        )
      }
    >
      <div className="space-y-4 text-xs sm:text-sm">
        {/* User & Current Plan Summary Card */}
        <div className="p-3.5 rounded-xl border bg-muted/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <Avatar className="size-10 shrink-0 border">
              <AvatarImage src={user?.imageUrl} alt={user.name} />
              <AvatarFallback>
                {getInitials(user.name) || <UserRound className="size-4" />}
              </AvatarFallback>
            </Avatar>
            <div>
              <div className="flex items-center gap-1.5">
                <p className="font-semibold text-foreground text-sm">
                  {user.name}
                </p>
                <Badge variant="outline" className="text-xs py-0 font-normal">
                  {user.role}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground font-mono">{user.email}</p>
            </div>
          </div>
          <div className="flex flex-col sm:items-end">
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-foreground">
                {plan?.name || "Pro Plan"}
              </span>
              <Badge
              size={"sm"}
                variant={
                  isActive
                    ? "success"
                    : subscriber.status === "CANCELLED"
                      ? "rejected"
                      : "pending"
                }
              >
                {subscriber.status}
              </Badge>
            </div>
            <span className="text-xs text-muted-foreground mt-0.5">
              Valid until:{" "}
              <strong className="text-foreground">
                {formatDate(subscriber.endDate)}
              </strong>
            </span>
          </div>
        </div>

        {/* Section 1: Quick Duration Extensions */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <Clock className="size-3.5 text-primary" />
              Quick Extend Validity
            </span>
            <button
              type="button"
              disabled={isPending}
              onClick={handleSetPromo2028}
              className="text-xs text-amber-500 hover:text-amber-400 font-medium flex items-center gap-1 cursor-pointer transition-colors"
            >
              <Sparkles className="size-3" />
              Set till Dec 2028
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {EXTENSION_PRESETS.map((preset) => (
              <Button
                key={preset.days}
                variant="outline"
                size="sm"
                disabled={isPending}
                onClick={() => handleExtend(preset.days)}
                className="text-xs font-medium hover:border-primary hover:text-primary transition-colors"
              >
                {preset.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Section 2: Clean Custom Expiry Date Selector */}
        <div className="space-y-2.5 pt-3 border-t border-border">
          <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
            <CalendarIcon className="size-3.5 text-primary" />
            Set Custom Expiry Date
          </span>

          <div className="grid grid-cols-3 gap-2">
            {/* Day */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Day</label>
              <Select
                value={selectedDay}
                onValueChange={(val) => {
                  if (val) setSelectedDay(val);
                }}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Day" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} className="max-h-48">
                  {daysList.map((d) => (
                    <SelectItem key={d} value={d}>
                      {d}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Month */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Month</label>
              <Select
                value={selectedMonth}
                onValueChange={(val) => {
                  if (val) setSelectedMonth(val);
                }}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} className="max-h-48">
                  {MONTH_NAMES.map((m, idx) => (
                    <SelectItem key={m} value={String(idx)}>
                      {m}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year */}
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground font-medium">Year</label>
              <Select
                value={selectedYear}
                onValueChange={(val) => {
                  if (val) setSelectedYear(val);
                }}
              >
                <SelectTrigger className="w-full h-8 text-xs">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent alignItemWithTrigger={false} className="max-h-48">
                  {YEARS.map((y) => (
                    <SelectItem key={y} value={y}>
                      {y}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-xs text-muted-foreground">
              New Expiry:{" "}
              <strong className="text-foreground font-semibold">
                {formatDate(computedDate.toISOString())}
              </strong>
            </span>
            <Button
              disabled={isPending}
              loading={isPending}
              loadingText="Saving..."
              onClick={handleCustomDateSubmit}
            >
              <CheckCircle2 />
              Save Expiry Date
            </Button>
          </div>
        </div>

        {/* Section 3: Danger Zone - Revoke */}
        <div className="pt-3 border-t border-border flex items-center justify-between">
          <div>
            <p className="font-semibold text-destructive text-xs">
              Revoke Subscription
            </p>
            <p className="text-xs text-muted-foreground">
              Cancels active subscription and returns user to Free tier.
            </p>
          </div>

          <ConfirmationModal
            title="Revoke User Subscription?"
            description={`Are you sure you want to cancel ${user.name}'s active subscription? They will immediately lose access to Pro tools until renewed.`}
            confirmText="Revoke Subscription"
            cancelText="Cancel"
            loadingText="Revoking..."
            variant="destructive"
            onConfirm={handleRevoke}
            actionTrigger={
              <Button
                variant="destructive"
                size="sm"
                className="gap-1.5 text-xs h-8"
              >
                <XCircle className="size-3.5" />
                Revoke
              </Button>
            }
          />
        </div>
      </div>
    </ModalWrapper>
  );
}
