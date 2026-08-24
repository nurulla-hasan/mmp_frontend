"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface PlanRow {
  id: string;
  name: string;
  code: string;
  price: number;
  discount: string;
  duration: string;
  features: number;
  active: boolean;
}

export const planColumns: ColumnDef<PlanRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "code",
    header: "Code",
    cell: ({ row }) => (
      <code className="rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground">
        {row.original.code}
      </code>
    ),
  },
  {
    accessorKey: "price",
    header: "Price",
    cell: ({ row }) => (
      <span className="text-sm">৳{row.original.price} / BDT</span>
    ),
  },
  {
    accessorKey: "discount",
    header: "Discount",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.discount || "—"}
      </span>
    ),
  },
  {
    accessorKey: "duration",
    header: "Duration",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.duration}
      </span>
    ),
  },
  {
    accessorKey: "features",
    header: "Features",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {row.original.features} features
      </span>
    ),
  },
  {
    accessorKey: "active",
    header: "Active",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "active" : "pending"}>
        {row.original.active ? "active" : "inactive"}
      </Badge>
    ),
  },
];
