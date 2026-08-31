import { getAllSubscribers } from "@/services/subscriber.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { subscriberColumns } from "./_components/subscriber-column";
import { SubscriberStatusFilter } from "./_components/subscriber-status-filter";
import type { TSubscriberQuery } from "@/interface/subscriber";

interface PageProps {
  searchParams: Promise<TSubscriberQuery>;
}

export default async function AdminSubscribersPage({
  searchParams,
}: PageProps) {
  const query = await searchParams;
  const res = await getAllSubscribers(query);

  const subscribers = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Subscribers Management"
          description="Manage active memberships, subscription packages, validity periods, and manual extensions."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <SubscriberStatusFilter />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by name, email, phone, plan..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable data={subscribers} columns={subscriberColumns} meta={meta} />
    </div>
  );
}
