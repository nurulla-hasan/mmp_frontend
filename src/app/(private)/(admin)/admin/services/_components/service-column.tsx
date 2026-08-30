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
    <div className="flex items-center gap-1.5">
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
            variant="outline"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10 border-border"
            aria-label="Delete service"
          >
            <Trash2 className="size-4" />
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
        <div className="flex size-8 items-center justify-center rounded-lg bg-primary/10 text-primary shrink-0">
          <Wrench className="size-4" />
        </div>
        <div className="font-medium text-foreground truncate max-w-52 sm:max-w-72">
          {row.original.name}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "slug",
    header: "URL Slug",
    cell: ({ row }) => (
      <code className="text-xs font-mono bg-muted/60 px-2 py-0.5 rounded text-muted-foreground border">
        {row.original.slug}
      </code>
    ),
  },
  {
    accessorKey: "description",
    header: "Description",
    cell: ({ row }) => {
      const desc = row.original.description;
      return (
        <span className="text-xs text-muted-foreground line-clamp-1 max-w-64">
          {desc || "No description provided."}
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
          <Users className="size-3.5" />
          <span className="font-medium text-foreground tabular-nums">{count}</span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground">
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
