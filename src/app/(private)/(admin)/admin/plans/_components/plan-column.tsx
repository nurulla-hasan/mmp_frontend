"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { Infinity, Power, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { PlanFormModal } from "./plan-form-modal";
import {
  togglePlanStatusAction,
  deletePlanAction,
} from "../_actions/plan.action";
import { SuccessToast, ErrorToast } from "@/lib/utils";
import type { TPlan } from "@/interface/plan";

export type PlanRow = TPlan;

function PlanActionsCell({ plan }: { plan: PlanRow }) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await togglePlanStatusAction(plan.id);
      if (res.success) {
        SuccessToast(
          `Plan "${plan.name}" ${plan.isActive ? "deactivated" : "activated"} successfully.`,
        );
      } else {
        ErrorToast(res.message || "Failed to change plan status.");
      }
    } catch {
      ErrorToast("An error occurred while changing plan status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deletePlanAction(plan.id);
      if (res.success) {
        SuccessToast(`Plan "${plan.name}" deleted successfully.`);
      } else {
        ErrorToast(res.message || "Failed to delete plan.");
      }
    } catch {
      ErrorToast("An error occurred while deleting plan.");
    }
  };

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Quick Toggle Active/Inactive */}
      <Button
        variant="outline"
        size="icon"
        disabled={isToggling}
        onClick={handleToggle}
        className={`size-8 ${
          plan.isActive
            ? "text-emerald-600 hover:text-emerald-700 hover:bg-emerald-500/10"
            : "text-muted-foreground hover:text-foreground"
        }`}
        aria-label={plan.isActive ? "Deactivate plan" : "Activate plan"}
      >
        <Power className="size-3.5" />
      </Button>

      {/* 2. Edit Modal */}
      <PlanFormModal plan={plan} />

      {/* 3. Delete Modal */}
      <ConfirmationModal
        title={`Delete Plan "${plan.name}"?`}
        description="Are you sure you want to permanently delete this plan? If users are currently subscribed, consider deactivating it instead."
        confirmText="Delete Plan"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        onConfirm={handleDelete}
        actionTrigger={
          <Button
            variant="outline"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete plan"
          >
            <Trash2 className="size-3.5" />
          </Button>
        }
      />
    </div>
  );
}

export const planColumns: ColumnDef<PlanRow>[] = [
  {
    accessorKey: "name",
    header: "Plan Name",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-semibold text-foreground text-sm">
            {row.original.name}
          </span>
          {row.original.isPopular && (
            <Badge variant="progress" size="sm" className="text-xs gap-1 py-0 font-normal">
              <Star className="size-2.5 fill-amber-400 text-amber-400" />
              Popular
            </Badge>
          )}
        </div>
        <code className="text-[11px] text-muted-foreground font-mono">
          {row.original.code}
        </code>
      </div>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex flex-col gap-0.5">
        <div className="flex items-center gap-1.5">
          <span className="font-bold text-foreground text-sm">
            ৳{row.original.price}
          </span>
          {row.original.originalPrice && (
            <span className="text-xs text-muted-foreground line-through">
              ৳{row.original.originalPrice}
            </span>
          )}
        </div>
        {row.original.discountBadge && (
          <span className="text-xs text-primary font-medium">
            {row.original.discountBadge}
          </span>
        )}
      </div>
    ),
  },
  {
    accessorKey: "durationDays",
    header: "Duration",
    cell: ({ row }) => (
      <div className="flex flex-col text-xs text-muted-foreground">
        <span className="font-medium text-foreground">
          {row.original.durationDays} Days
        </span>
        <span className="text-[11px] capitalize">
          {row.original.billingCycle.toLowerCase().replace("_", " ")}
        </span>
      </div>
    ),
  },
  {
    id: "access",
    header: "Access",
    cell: () => (
      <Badge variant="outline" size="sm" className="gap-1 text-xs font-normal border-primary/30 text-primary">
        <Infinity className="size-3" />
        Unlimited
      </Badge>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-medium">
        {row.original.features?.length || 0} features
      </span>
    ),
  },
  {
    id: "subscribers",
    header: "Subscribers",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-medium">
        {row.original._count?.subscriptions || 0} active
      </span>
    ),
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.isActive ? "active" : "pending"}>
        {row.original.isActive ? "Active" : "Inactive"}
      </Badge>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <PlanActionsCell plan={row.original} />,
  },
];
