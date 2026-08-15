import type { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export interface ServiceCategoryRow {
  id: string;
  name: string;
  slug: string;
  status: string;
}

export const serviceCategoryColumns: ColumnDef<ServiceCategoryRow>[] = [
  {
    accessorKey: "name",
    header: "Name",
    cell: ({ row }) => (
      <div className="font-medium text-foreground">{row.original.name}</div>
    ),
  },
  {
    accessorKey: "slug",
    header: "Slug",
    cell: ({ row }) => (
      <span className="text-sm text-muted-foreground">{row.original.slug}</span>
    ),
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={row.original.status === "published" ? "success" : "outline"}
      >
        {row.original.status}
      </Badge>
    ),
  },
];
