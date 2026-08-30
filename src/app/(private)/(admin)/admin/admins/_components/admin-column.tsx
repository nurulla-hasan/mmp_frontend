"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Trash2,
  ShieldCheck,
  ShieldAlert,
  UserCheck,
  UserX,
  Phone,
  UserRound,
} from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import {
  updateAdminStatusAction,
  deleteAdminAction,
} from "../_actions/admin.action";
import { SuccessToast, ErrorToast, formatDate, getInitials } from "@/lib/utils";
import type { TUser } from "@/interface/user";

export type AdminRow = TUser;

function AdminActionsCell({ admin }: { admin: AdminRow }) {
  const isSuperAdmin = admin.role === "SUPER_ADMIN";
  const isBlocked = admin.status === "BLOCKED";
  const newStatus = isBlocked ? "ACTIVE" : "BLOCKED";

  const handleStatusToggle = async () => {
    try {
      const res = await updateAdminStatusAction(admin.id, newStatus);
      if (res.success) {
        SuccessToast(
          `Admin "${admin.name}" ${isBlocked ? "activated" : "blocked"} successfully.`,
        );
      } else {
        ErrorToast(res.message || "Failed to update admin status.");
      }
    } catch {
      ErrorToast("An error occurred while updating status.");
    }
  };

  const handleDelete = async () => {
    try {
      const res = await deleteAdminAction(admin.id);
      if (res.success) {
        SuccessToast(`Admin "${admin.name}" deleted successfully.`);
      } else {
        ErrorToast(res.message || "Failed to delete admin.");
      }
    } catch {
      ErrorToast("An error occurred while deleting admin.");
    }
  };

  // Super Admins cannot be blocked or deleted
  if (isSuperAdmin) {
    return (
      <span className="text-xs font-medium text-muted-foreground/60 italic">
        Protected
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1.5">
      {/* 1. Status Toggle Action */}
      <ConfirmationModal
        title={isBlocked ? "Activate Administrator?" : "Block Administrator?"}
        description={
          isBlocked
            ? `Are you sure you want to restore administrative access for "${admin.name}"?`
            : `Are you sure you want to block "${admin.name}"? They will lose administrative access immediately.`
        }
        confirmText={isBlocked ? "Activate Access" : "Block Admin"}
        cancelText="Cancel"
        loadingText={isBlocked ? "Activating..." : "Blocking..."}
        variant={isBlocked ? "default" : "destructive"}
        onConfirm={handleStatusToggle}
        actionTrigger={
          <Button
            variant="outline"
            size="icon"
            className="size-8"
            aria-label={isBlocked ? "Activate admin" : "Block admin"}
          >
            {isBlocked ? (
              <UserCheck className="size-4 text-emerald-600" />
            ) : (
              <UserX className="size-4 text-amber-600" />
            )}
          </Button>
        }
      />

      {/* 2. Delete Action */}
      <ConfirmationModal
        title="Delete Administrator?"
        description={`Are you sure you want to delete administrator "${admin.name}"? This action cannot be undone.`}
        confirmText="Delete Admin"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        onConfirm={handleDelete}
        actionTrigger={
          <Button
            variant="outline"
            size="icon"
            className="size-8 text-destructive hover:text-destructive hover:bg-destructive/10"
            aria-label="Delete admin"
          >
            <Trash2 className="size-4" />
          </Button>
        }
      />
    </div>
  );
}

export const adminColumns: ColumnDef<AdminRow>[] = [
  {
    accessorKey: "name",
    header: "Administrator",
    cell: ({ row }) => (
      <div className="flex items-center gap-3">
        <Avatar className="size-8 sm:size-9 shrink-0 border border-border">
          <AvatarImage src={row.original.imageUrl} alt={row.original.name} />
          <AvatarFallback>
            {getInitials(row.original.name) || (
              <UserRound className="size-4" />
            )}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-medium text-foreground">
              {row.original.name}
            </span>
            {row.original.role === "SUPER_ADMIN" ? (
              <ShieldAlert className="size-3.5 text-purple-600" />
            ) : (
              <ShieldCheck className="size-3.5 text-primary" />
            )}
          </div>
          {row.original.phone && (
            <span className="flex items-center gap-1 text-[11px] text-muted-foreground">
              <Phone className="size-3" />
              {row.original.phone}
            </span>
          )}
        </div>
      </div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email Address",
    cell: ({ row }) => (
      <code className="text-xs font-mono bg-muted/60 px-2 py-0.5 rounded text-muted-foreground border">
        {row.original.email}
      </code>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const isSuper = row.original.role === "SUPER_ADMIN";
      return (
        <Badge
          variant={isSuper ? "default" : "secondary"}
          className={
            isSuper
              ? "bg-purple-600/15 text-purple-700 dark:text-purple-300 border-purple-300/40"
              : ""
          }
        >
          {isSuper ? "Super Admin" : "Admin"}
        </Badge>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const isBlocked = row.original.status === "BLOCKED";
      return (
        <Badge variant={isBlocked ? "destructive" : "success"}>
          {row.original.status}
        </Badge>
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
    cell: ({ row, table }) => {
      const isSuperAdmin = (
        table.options.meta as { isSuperAdmin?: boolean } | undefined
      )?.isSuperAdmin;

      if (!isSuperAdmin) {
        return (
          <span className="text-xs font-medium text-muted-foreground/60 italic">
            View only
          </span>
        );
      }

      return <AdminActionsCell admin={row.original} />;
    },
  },
];
