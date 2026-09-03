import { getServices } from "@/services/service.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { serviceColumns } from "./_components/service-column";
import { ServiceModal } from "./_components/service-modal";
import type { TServiceQuery } from "@/interface/service";

interface PageProps {
  searchParams: Promise<TServiceQuery>;
}

export default async function AdminServicesPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const res = await getServices(query);

  const services = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Services Management"
          description="Manage land surveying service categories, descriptions, and catalog."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <ServiceModal actionType="create" />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by name or slug..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable
        data={services}
        columns={serviceColumns}
        meta={meta}
      />
    </div>
  );
}
