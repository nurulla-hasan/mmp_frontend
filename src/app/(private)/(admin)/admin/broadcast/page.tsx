import { getAllBroadcasts } from "@/services/broadcast.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { broadcastColumns } from "./_components/broadcast-column";
import { BroadcastFormModal } from "./_components/broadcast-form-modal";
import { BroadcastTypeFilter } from "./_components/broadcast-type-filter";
import type { TBroadcastQuery } from "@/interface/broadcast";

interface PageProps {
  searchParams: Promise<TBroadcastQuery>;
}

export default async function AdminBroadcastPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const res = await getAllBroadcasts(query);

  const broadcasts = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Broadcast Notifications"
          description="Send system-wide announcements, promotional campaign alerts, and maintenance updates to platform users."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <BroadcastTypeFilter />
          <BroadcastFormModal />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by title, message..."
            className="w-full sm:w-64"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable data={broadcasts} columns={broadcastColumns} meta={meta} />
    </div>
  );
}
