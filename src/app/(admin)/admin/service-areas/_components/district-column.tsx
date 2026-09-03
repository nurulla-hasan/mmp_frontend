"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Trash2, MapPin } from "lucide-react";

import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { DistrictModal } from "./district-modal";
import { UpazilaManageModal } from "./upazila-manage-modal";
import { deleteDistrictAction } from "../_actions/district.action";
import { SuccessToast, ErrorToast, formatDate } from "@/lib/utils";
import type { TDistrict } from "@/interface/district";

export type DistrictRow = TDistrict;

function DistrictActionsCell({ district }: { district: DistrictRow }) {
  const handleDelete = async () => {
    try {
      const res = await deleteDistrictAction(district.id);
      if (res.success) {
        SuccessToast(`District "${district.name}" deleted successfully.`);
      } else {
        ErrorToast(res.message || "Failed to delete district.");
      }
    } catch {
      ErrorToast("An error occurred while deleting district.");
    }
  };

  return (
    <div className="flex items-center gap-1.5 justify-end">
      {/* 1. Manage Upazilas */}
      <UpazilaManageModal district={district} />

      {/* 2. Edit District */}
      <DistrictModal actionType="edit" defaultData={district} />

      {/* 3. Delete District */}
      <ConfirmationModal
        title={`Delete district "${district.name}"?`}
        description={`Are you sure you want to delete "${district.name}"? All upazilas associated with this district will also be deleted.`}
        confirmText="Delete District"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        onConfirm={handleDelete}
        actionTrigger={
          <Button
            variant="destructive"
            size="icon"
            aria-label="Delete district"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />
    </div>
  );
}

export const districtColumns: ColumnDef<DistrictRow>[] = [
  {
    accessorKey: "name",
    header: "District Name",
    cell: ({ row }) => (
      <div className="flex items-center gap-2.5">
        <div className="flex size-7 items-center justify-center rounded-md bg-primary/10 text-primary shrink-0">
          <MapPin className="size-3.5" />
        </div>
        <span className="text-foreground truncate max-w-56">
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
    id: "upazilas",
    header: "Upazilas",
    cell: ({ row }) => {
      const count =
        row.original.upazilaList?.length ?? row.original.upazilas?.length ?? 0;
      return (
        <div className="flex items-center gap-2">
          <span className="text-xs text-muted-foreground">
            {count} {count === 1 ? "Upazila" : "Upazilas"}
          </span>
        </div>
      );
    },
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
    cell: ({ row }) => {
      const date = row.original.createdAt;
      return (
        <span className="text-xs text-muted-foreground">
          {date ? formatDate(date) : "—"}
        </span>
      );
    },
  },
  {
    id: "actions",
    header: () => <div className="text-right">Actions</div>,
    cell: ({ row }) => <DistrictActionsCell district={row.original} />,
  },
];

