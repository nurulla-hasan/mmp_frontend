import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface BroadcastRow {
  id: string;
  title: string;
  message: string;
  active: boolean;
}

export const broadcastColumns: ColumnDef<BroadcastRow>[] = [
  {
    accessorKey: "title",
    header: "Title",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.title}</div>
    ),
  },
  {
    accessorKey: "message",
    header: "Message",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">
        {row.original.message}
      </span>
    ),
  },
  {
    accessorKey: "active",
    header: "Status",
    cell: ({ row }) => (
      <Badge variant={row.original.active ? "active" : "pending"}>
        {row.original.active ? "active" : "inactive"}
      </Badge>
    ),
  },
];
