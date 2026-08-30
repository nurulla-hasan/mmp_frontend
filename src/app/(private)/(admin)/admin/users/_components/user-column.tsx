"use client";

import { useState } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import {
  MoreHorizontal,
  ShieldAlert,
  ShieldCheck,
  UserCheck,
  UserX,
  Trash2,
  Phone,
  UserRound,
  Eye,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ConfirmationModal } from "@/components/common/confirmation-modal";
import { UserDetailsModal } from "./user-details-modal";
import {
  updateUserStatusAction,
  updateUserRoleAction,
  deleteUserAction,
} from "../_actions/user.action";
import { SuccessToast, ErrorToast, formatDate, getInitials } from "@/lib/utils";
import type { TUser, TUserRole, TUserStatus } from "@/interface/user";

export type UserRow = TUser;

function UserActionsCell({ user }: { user: UserRow }) {
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);
  const [statusToSet, setStatusToSet] = useState<TUserStatus | null>(null);

  const [isUpdatingRole, setIsUpdatingRole] = useState(false);
  const [roleToSet, setRoleToSet] = useState<TUserRole | null>(null);

  const handleStatusChange = async () => {
    if (!statusToSet) return;
    setIsUpdatingStatus(true);
    try {
      const res = await updateUserStatusAction(user.id, statusToSet);
      if (res.success) {
        SuccessToast(
          statusToSet === "ACTIVE"
            ? `User "${user.name}" has been activated.`
            : `User "${user.name}" has been blocked.`,
        );
      } else {
        ErrorToast(res.message || "Failed to update user status.");
      }
    } catch {
      ErrorToast("An error occurred while updating status.");
    } finally {
      setIsUpdatingStatus(false);
      setStatusToSet(null);
    }
  };

  const handleRoleChange = async () => {
    if (!roleToSet) return;
    setIsUpdatingRole(true);
    try {
      const res = await updateUserRoleAction(user.id, roleToSet);
      if (res.success) {
        SuccessToast(`User "${user.name}" role updated to ${roleToSet}.`);
      } else {
        ErrorToast(res.message || "Failed to update user role.");
      }
    } catch {
      ErrorToast("An error occurred while updating role.");
    } finally {
      setIsUpdatingRole(false);
      setRoleToSet(null);
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await deleteUserAction(user.id);
      if (res.success) {
        SuccessToast(`User "${user.name}" account deleted successfully.`);
      } else {
        ErrorToast(res.message || "Failed to delete user account.");
      }
    } catch {
      ErrorToast("An error occurred while deleting user.");
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  const nextStatus: TUserStatus = user.status === "ACTIVE" ? "BLOCKED" : "ACTIVE";

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger
          render={
            <Button variant="outline" size="icon">
              <span className="sr-only">Open action menu</span>
              <MoreHorizontal />
            </Button>
          }
        />
        <DropdownMenuContent align="end" className="w-48">
          <DropdownMenuGroup>
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            {/* View Details Action */}
            <DropdownMenuItem
              onClick={() => setShowDetailsModal(true)}
              className="cursor-pointer"
            >
              <Eye className="mr-2 size-4 text-primary" />
              <span>View Details</span>
            </DropdownMenuItem>

            {/* Status Toggle Action */}
            <DropdownMenuItem
              onClick={() => setStatusToSet(nextStatus)}
              className="cursor-pointer"
            >
              {user.status === "ACTIVE" ? (
                <>
                  <UserX className="mr-2 size-4 text-destructive" />
                  <span className="text-destructive">Block Account</span>
                </>
              ) : (
                <>
                  <UserCheck className="mr-2 size-4 text-emerald-600 dark:text-emerald-400" />
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Activate Account
                  </span>
                </>
              )}
            </DropdownMenuItem>
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
              Change Role
            </DropdownMenuLabel>

            {user.role !== "USER" && (
              <DropdownMenuItem
                onClick={() => setRoleToSet("USER")}
                className="cursor-pointer"
              >
                <UserRound className="mr-2 size-4" />
                <span>Make USER</span>
              </DropdownMenuItem>
            )}

            {user.role !== "SURVEYOR" && (
              <DropdownMenuItem
                onClick={() => setRoleToSet("SURVEYOR")}
                className="cursor-pointer"
              >
                <ShieldCheck className="mr-2 size-4 text-sky-600" />
                <span>Make SURVEYOR</span>
              </DropdownMenuItem>
            )}

            {user.role !== "ADMIN" && (
              <DropdownMenuItem
                onClick={() => setRoleToSet("ADMIN")}
                className="cursor-pointer"
              >
                <ShieldAlert className="mr-2 size-4 text-violet-600" />
                <span>Make ADMIN</span>
              </DropdownMenuItem>
            )}
          </DropdownMenuGroup>

          <DropdownMenuSeparator />

          <DropdownMenuGroup>
            {/* Delete Action */}
            <DropdownMenuItem
              onClick={() => setShowDeleteModal(true)}
              className="cursor-pointer text-destructive focus:text-destructive"
            >
              <Trash2 className="mr-2 size-4" />
              <span>Delete User</span>
            </DropdownMenuItem>
          </DropdownMenuGroup>
        </DropdownMenuContent>
      </DropdownMenu>

      {/* User Details Modal */}
      <UserDetailsModal
        user={user}
        open={showDetailsModal}
        onOpenChange={setShowDetailsModal}
      />

      {/* Confirmation Modal for Status Change */}
      <ConfirmationModal
        open={!!statusToSet}
        onOpenChange={(val) => !val && setStatusToSet(null)}
        title={
          statusToSet === "BLOCKED"
            ? "Block user account?"
            : "Activate user account?"
        }
        description={
          statusToSet === "BLOCKED"
            ? `User "${user.name}" will be temporarily blocked from accessing the platform.`
            : `User "${user.name}" will be granted active access to the platform.`
        }
        confirmText={statusToSet === "BLOCKED" ? "Block Account" : "Activate Account"}
        cancelText="Cancel"
        loadingText="Updating..."
        variant={statusToSet === "BLOCKED" ? "destructive" : "default"}
        isLoading={isUpdatingStatus}
        onConfirm={handleStatusChange}
      />

      {/* Confirmation Modal for Role Change */}
      <ConfirmationModal
        open={!!roleToSet}
        onOpenChange={(val) => !val && setRoleToSet(null)}
        title="Change user role?"
        description={`The role for "${user.name}" will be changed to "${roleToSet}".`}
        confirmText="Change Role"
        cancelText="Cancel"
        loadingText="Updating..."
        isLoading={isUpdatingRole}
        onConfirm={handleRoleChange}
      />

      {/* Confirmation Modal for Delete */}
      <ConfirmationModal
        open={showDeleteModal}
        onOpenChange={(val) => !val && setShowDeleteModal(false)}
        title="Delete user account?"
        description={`All data for "${user.name}" (${user.email}) will be permanently deleted. This action cannot be undone.`}
        confirmText="Permanently Delete"
        cancelText="Cancel"
        loadingText="Deleting..."
        variant="destructive"
        isLoading={isDeleting}
        onConfirm={handleDelete}
      />
    </>
  );
}

export const userColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "User",
    cell: ({ row }) => {
      const user = row.original;
      return (
        <div className="flex items-center gap-2.5">
          <Avatar className="shrink-0">
            <AvatarImage src={user.imageUrl || undefined} alt={user.name} />
            <AvatarFallback>
              {getInitials(user.name) || <UserRound />}
            </AvatarFallback>
          </Avatar>
          <div className="flex flex-col">
            <span className="font-semibold text-foreground text-xs">
              {user.name}
            </span>
            {user.phone ? (
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Phone className="size-2.5" />
                {user.phone}
              </span>
            ) : null}
          </div>
        </div>
      );
    },
  },
  {
    accessorKey: "email",
    header: "Email",
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
      const role = row.original.role;
      let variant: "default" | "info" | "admin" = "default";
      if (role === "SURVEYOR") variant = "info";
      if (role === "ADMIN" || role === "SUPER_ADMIN") variant = "admin";

      return <Badge variant={variant}>{role}</Badge>;
    },
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => {
      const status = row.original.status;
      const isBlocked = status === "BLOCKED";

      return (
        <Badge variant={isBlocked ? "blocked" : "active"}>
          {status}
        </Badge>
      );
    },
  },
  {
    accessorKey: "plotsMeasured",
    header: "Plots Measured",
    cell: ({ row }) => (
      <span className="text-xs font-mono font-medium text-foreground">
        {row.original.plotsMeasured || 0}
      </span>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Joined Date",
    cell: ({ row }) => (
      <span className="text-xs text-muted-foreground font-mono">
        {formatDate(row.original.createdAt)}
      </span>
    ),
  },
  {
    id: "actions",
    header: "Actions",
    cell: ({ row }) => <UserActionsCell user={row.original} />,
  },
];
