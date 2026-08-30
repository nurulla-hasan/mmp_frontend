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
    <div className="flex items-center gap-1">
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
            aria-label={isBlocked ? "Activate admin" : "Block admin"}
          >
            {isBlocked ? (
              <UserCheck className="size-3.5 text-emerald-600" />
            ) : (
              <UserX className="size-3.5 text-amber-600" />
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
            variant="destructive"
            size="icon"
            aria-label="Delete admin"
          >
            <Trash2 />
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
      <div className="flex items-center gap-2.5">
        <Avatar className="shrink-0">
          <AvatarImage src={row.original.imageUrl} alt={row.original.name} />
          <AvatarFallback>
            {getInitials(row.original.name) || <UserRound />}
          </AvatarFallback>
        </Avatar>
        <div className="flex flex-col">
          <div className="flex items-center gap-1.5">
            <span className="font-semibold text-foreground text-xs">
              {row.original.name}
            </span>
            {row.original.role === "SUPER_ADMIN" ? (
              <ShieldAlert className="size-3 text-purple-600" />
            ) : (
              <ShieldCheck className="size-3 text-primary" />
            )}
          </div>
          {row.original.phone && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground">
              <Phone className="size-2.5" />
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
      <span className="text-xs text-muted-foreground font-mono">
        {row.original.email}
      </span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => {
      const isSuper = row.original.role === "SUPER_ADMIN";
      return (
        <Badge
          variant={isSuper ? "admin" : "manager"}
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
        <Badge variant={isBlocked ? "blocked" : "active"}>
          {row.original.status}
        </Badge>
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
