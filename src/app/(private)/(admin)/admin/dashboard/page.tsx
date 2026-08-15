"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { Badge } from "@/components/ui/badge";
import type { ColumnDef } from "@tanstack/react-table";

interface ActivityRow {
  id: string;
  entity: string;
  action: string;
  status: "success" | "pending" | "rejected";
  at: string;
}

const activityColumns: ColumnDef<ActivityRow>[] = [
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

const Activity: ActivityRow[] = [
  {
    id: "act-001",
    entity: "মো. আব্দুল করিম",
    action: "Surveyor verification",
    status: "pending",
    at: "2026-06-10T11:20:00.000Z",
  },
  {
    id: "act-002",
    entity: "সাবিনা ইয়াসমিন",
    action: "Subscription renewed",
    status: "success",
    at: "2026-06-09T09:00:00.000Z",
  },
  {
    id: "act-003",
    entity: "নাসিমা আক্তার",
    action: "Document rejected",
    status: "rejected",
    at: "2026-06-08T14:30:00.000Z",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Admin Dashboard"
        description="Data-centric overview of platform operations."
        as="h3"
        alignment="left"
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="rounded-lg border border-border p-4">
          <div className="font-medium">Total Users</div>
          <div className="text-2xl font-bold">1,248</div>
          <div className="text-sm text-muted-foreground">
            Registered user accounts.
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="font-medium">Total Surveyors</div>
          <div className="text-2xl font-bold">312</div>
          <div className="text-sm text-muted-foreground">
            Professional surveyor accounts.
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="font-medium">Pending Verifications</div>
          <div className="text-2xl font-bold">18</div>
          <div className="text-sm text-muted-foreground">
            Identity and document reviews.
          </div>
        </div>
        <div className="rounded-lg border border-border p-4">
          <div className="font-medium">Active Jobs</div>
          <div className="text-2xl font-bold">47</div>
          <div className="text-sm text-muted-foreground">
            Current land-service jobs.
          </div>
        </div>
      </div>

      <SectionHeading
        title="Recent Activity"
        description="Latest platform events."
        as="h3"
        alignment="left"
      />
      <DataTable
        data={Activity}
        columns={activityColumns}
        searchKey="entity"
        searchPlaceholder="Search activity..."
      />
    </div>
  );
}
