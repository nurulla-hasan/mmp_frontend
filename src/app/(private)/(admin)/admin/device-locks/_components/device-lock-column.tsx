import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type LockStatus = "locked" | "unlocked";

export interface DeviceLockRow {
  id: string;
  user: string;
  device: string;
  reason: string;
  status: LockStatus;
  lockedAt: string;
}

const statusBadgeVariant: Record<LockStatus, "blocked" | "active"> = {
  locked: "blocked",
  unlocked: "active",
};

export const deviceLockColumns: ColumnDef<DeviceLockRow>[] = [
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.user}</div>
    ),
  },
  {
    accessorKey: "device",
    header: "Device",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.device}</span>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.reason}
      </span>
    ),
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
    accessorKey: "lockedAt",
    header: "Locked At",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.lockedAt).toLocaleDateString("en-US")}
      </span>
    ),
  },
];
