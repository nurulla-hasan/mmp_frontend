import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type VerificationStatus = "approved" | "pending" | "rejected";

export interface VerificationRow {
  id: string;
  name: string;
  type: "Identity" | "Professional" | "Document";
  status: VerificationStatus;
  submittedAt: string;
}

const statusBadgeVariant: Record<
  VerificationStatus,
  "success" | "pending" | "rejected"
> = {
  approved: "success",
  pending: "pending",
  rejected: "rejected",
};

export const verificationColumns: ColumnDef<VerificationRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.type}</span>
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
    accessorKey: "submittedAt",
    header: "Submitted",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.submittedAt).toLocaleDateString("en-US")}
      </span>
    ),
  },
];
