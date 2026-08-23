import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import {
  activityColumns,
  type ActivityRow,
} from "./_components/activity-column";

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

      <div className="flex flex-col justify-between items-end sm:flex-row">
        <SectionHeading
          title="Recent Activity"
          description="Latest platform events."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <SearchInput filterKey="entity" placeholder="Search activity..." />
      </div>
      <DataTable data={Activity} columns={activityColumns} />
    </div>
  );
}
