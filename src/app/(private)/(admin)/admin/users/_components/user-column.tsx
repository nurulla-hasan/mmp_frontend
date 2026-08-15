import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type UserStatus = "active" | "blocked" | "pending";

export interface UserRow {
  id: string;
  name: string;
  email: string;
  plotsMeasured: number;
  role: "USER" | "SURVEYOR" | "ADMIN";
  status: UserStatus;
}

const statusBadgeVariant: Record<UserStatus, "active" | "blocked" | "pending"> = {
  active: "active",
  blocked: "blocked",
  pending: "pending",
};

export const userColumns: ColumnDef<UserRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.email}</span>
    ),
  },
  {
    accessorKey: "role",
    header: "Role",
    cell: ({ row }) => <Badge variant="secondary">{row.original.role}</Badge>,
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={statusBadgeVariant[row.original.status]}>
        {row.original.status}
      </Badge>
    ),
  },
  {
    accessorKey: "plotsMeasured",
    header: "Plots Measured",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {row.original.plotsMeasured}
      </span>
    ),
  },
];
