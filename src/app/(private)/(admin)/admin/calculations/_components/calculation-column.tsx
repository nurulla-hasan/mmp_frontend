"use client";

import type { ColumnDef } from "@tanstack/react-table";

export interface CalculationRow {
  id: string;
  projectName: string;
  userName: string;
  userEmail: string;
  scale: string;
  plots: number;
  created: string;
}

export const calculationColumns: ColumnDef<CalculationRow>[] = [
  {
    accessorKey: "projectName",
    header: "Project Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">
        {row.original.projectName}
      </div>
    ),
  },
  {
    accessorKey: "user",
    header: "User",
    cell: ({ row }) => (
      <div className="flex flex-col">
        <span className="text-sm text-foreground">{row.original.userName}</span>
        <span className="text-xs text-muted-foreground">
          {row.original.userEmail}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "scale",
    header: "Scale",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {row.original.scale}
      </span>
    ),
  },
  {
    accessorKey: "plots",
    header: "Plots",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {row.original.plots}
      </span>
    ),
  },
  {
    accessorKey: "created",
    header: "Created",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.created}
      </span>
    ),
  },
];
