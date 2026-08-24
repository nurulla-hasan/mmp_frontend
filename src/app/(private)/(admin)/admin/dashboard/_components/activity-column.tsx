"use client";

import type { ColumnDef } from "@tanstack/react-table";

import { Badge } from "@/components/ui/badge";

export interface ActivityRow {
  id: string;
  entity: string;
  action: string;
  status: "success" | "pending" | "rejected";
  at: string;
}

export const activityColumns: ColumnDef<ActivityRow>[] = [
  {
    accessorKey: "entity",
    header: "Entity",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.entity}</div>
    ),
  },
  {
    accessorKey: "action",
    header: "Action",
    cell: ({ row }) => (
      <span className="text-sm">{row.original.action}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.status}>{row.original.status}</Badge>
    ),
  },
  {
    accessorKey: "at",
    header: "Time",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {new Date(row.original.at).toLocaleDateString("en-US")}
      </span>
    ),
  },
];
