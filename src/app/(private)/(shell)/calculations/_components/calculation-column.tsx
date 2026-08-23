"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { FileText, Map as MapIcon } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

export interface CalculationRow {
  id: string;
  name: string;
  date: string;
  mapName: string;
  scale: string;
  totalPlots: number;
}

export const calculationColumns: ColumnDef<CalculationRow>[] = [
  {
    accessorKey: "name",
    header: "নাম",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "date",
    header: "তারিখ",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.date}</span>
    ),
  },
  {
    accessorKey: "mapName",
    header: "ম্যাপের নাম",
    cell: ({ row }) => (
      <span className="flex items-center gap-2 text-sm text-muted-foreground">
        <FileText className="size-4 shrink-0 text-muted-foreground/70" />
        {row.original.mapName}
      </span>
    ),
  },
  {
    accessorKey: "scale",
    header: "স্কেল",
    cell: ({ row }) => <Badge variant="secondary">{row.original.scale}</Badge>,
  },
  {
    accessorKey: "totalPlots",
    header: "মোট দাগ",
    cell: ({ row }) => (
      <span className="text-sm tabular-nums text-foreground">
        {row.original.totalPlots} টি
      </span>
    ),
  },
  {
    id: "actions",
    header: "অ্যাকশন",
    meta: { headerClassName: "text-right" },
    cell: () => (
      <div className="flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5"
          nativeButton={false}
          render={<a href="#" />}
        >
          <MapIcon className="size-4" />
          ম্যাপে খুলুন
        </Button>
      </div>
    ),
  },
];
