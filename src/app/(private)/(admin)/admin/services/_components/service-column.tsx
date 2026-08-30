"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, Wrench, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { ServiceModal } from "./service-modal";
import { deleteServiceAction } from "../_actions/service.action";
import { SuccessToast, ErrorToast, formatDate } from "@/lib/utils";
import type { TService } from "@/interface/service";

export type ServiceRow = TService;

function ServiceActionsCell({ service }: { service: ServiceRow }) {
  const handleDelete = async () => {
    try {
      const res = await deleteServiceAction(service.id);
      if (res.success) {
        SuccessToast(`Service "${service.name}" deleted successfully.`);
      } else {
        ErrorToast(res.message || "Failed to delete service.");
      }
    } catch {
      ErrorToast("An error occurred while deleting service.");
    }
  };

  return (
    <div className="flex items-center gap-1">
      {/* 1. Edit Action Modal */}
      <ServiceModal actionType="edit" defaultData={service} />

      {/* 2. Delete Action Modal */}
      <ConfirmationModal
        title="Delete service category?"
        description={`Are you sure you want to delete "${service.name}"? Surveyors offering this service will no longer have it linked.`}
        confirmText="Delete Service"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        onConfirm={handleDelete}
        actionTrigger={
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete service"
          >
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}

export const serviceColumns: ColumnDef<ServiceRow>[] = [
  {
    accessorKey: "name",
    header: "Service Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <Wrench className="size-3.5" />
        </div>
        <span className="font-semibold text-foreground text-xs truncate max-w-56">
          {row.original.name}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "URL Slug",
    cell: ({ row }) => (
      <span className="text-xs font-mono text-muted-foreground">
        {row.original.slug}
      </span>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.description;
      return (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-64">
          {desc || "—"}
        </span>
      );
    },
  },
  {
    accessorKey: "surveyorsCount",
    header: "Surveyors",
    cell: ({ row }) => {
      const count = row.original.surveyorsCount || 0;
      return (
        <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <Users className="size-3" />
          <span className="font-medium text-foreground tabular-nums font-mono">{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <ServiceActionsCell service={row.original} />,
  },
];
