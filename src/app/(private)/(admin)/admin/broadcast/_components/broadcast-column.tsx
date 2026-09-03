"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  AlertTriangle,
  ExternalLink,
  Info,
  Pin,
  Power,
  Sparkles,
  Trash2,
  Wrench,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { BroadcastFormModal } from "./broadcast-form-modal";
import {
  toggleBroadcastStatusAction,
  deleteBroadcastAction,
} from "../_actions/broadcast.action";
import { SuccessToast, ErrorToast, formatDate } from "@/lib/utils";
import type { TBroadcast, TBroadcastType } from "@/interface/broadcast";

export type BroadcastRow = TBroadcast;

function renderTypeBadge(type: TBroadcastType) {
  switch (type) {
    case "PROMO":
      return (
        <Badge variant="progress">
          <Sparkles />
          Promo
        </Badge>
      );
    case "WARNING":
      return (
        <Badge variant="pending">
          <AlertTriangle />
          Warning
        </Badge>
      );
    case "MAINTENANCE":
      return (
        <Badge variant="admin">
          <Wrench />
          Maintenance
        </Badge>
      );
    case "INFO":
    default:
      return (
        <Badge variant="info">
          <Info />
          Info
        </Badge>
      );
  }
}

function BroadcastActionsCell({ broadcast }: { broadcast: BroadcastRow }) {
  const [isToggling, setIsToggling] = useState(false);

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      const res = await toggleBroadcastStatusAction(broadcast.id);
      if (res.success) {
        SuccessToast(
          `Broadcast announcement ${broadcast.isActive ? "deactivated" : "activated"} successfully.`,
        );
      } else {
        ErrorToast(res.message || "Failed to toggle broadcast status.");
      }
    } catch {
      ErrorToast("An error occurred while changing status.");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteBroadcastAction(broadcast.id);
      if (res.success) {
        SuccessToast("Broadcast announcement deleted successfully.");
      } else {
        ErrorToast(res.message || "Failed to delete broadcast.");
      }
    } catch {
      ErrorToast("An error occurred while deleting announcement.");
    }
  };

  return (
    <div className="flex items-center gap-1 justify-end">
      {/* 1. Quick Power Toggle */}
      <Button
        variant={broadcast.isActive ? "default" : "outline"}
        size="icon"
        disabled={isToggling}
        onClick={handleToggle}
        aria-label={broadcast.isActive ? "Deactivate" : "Activate"}
      >
        <Power />
      </Button>

      {/* 2. Edit Modal */}
      <BroadcastFormModal broadcast={broadcast} />

      {/* 3. Delete Modal */}
      <ConfirmationModal
        title="Delete Announcement?"
        description="Are you sure you want to permanently delete this broadcast notification? Users will no longer see this announcement."
        confirmText="Delete"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        onConfirm={handleDelete}
        actionTrigger={
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete announcement"
          >
            <Trash2 />
          </Button>
        }
      />
    </div>
  );
}

export const broadcastColumns: ColumnDef<BroadcastRow>[] = [
  {
    accessorKey: "title",
    header: "Announcement",
    cell: ({ row }) => (
      <div className="flex items-center gap-1.5 max-w-65">
        {row.original.isPinned && (
          <Pin className="size-3 text-primary shrink-0 fill-primary rotate-45" />
        )}
        <span className="font-semibold text-foreground text-xs leading-snug line-clamp-1">
          {row.original.title}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => renderTypeBadge(row.original.type),
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <div className="flex flex-col gap-1 max-w-[320px]">
        <p className="text-xs text-muted-foreground line-clamp-2 truncate leading-relaxed">
          {row.original.message}
        </p>
        {row.original.linkUrl && (
          <a
            href={row.original.linkUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs text-primary hover:underline flex items-center gap-1 font-medium"
          >
            <ExternalLink className="size-3" />
            {row.original.linkText || row.original.linkUrl}
          </a>
        )}
      </div>
    ),
  },
  {
    accessorKey: "target",
    header: "Target",
    cell: ({ row }) => (
      <Badge variant="outline">
        {row.original.target}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Published At",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {formatDate(row.original.createdAt)}
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
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <BroadcastActionsCell broadcast={row.original} />,
  },
];
