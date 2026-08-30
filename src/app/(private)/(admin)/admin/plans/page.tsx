import { getAllPlans } from "@/services/plan.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { planColumns } from "./_components/plan-column";
import { PlanFormModal } from "./_components/plan-form-modal";
import type { TPlanQuery } from "@/interface/plan";

interface PageProps {
  searchParams: Promise<TPlanQuery>;
}

export default async function AdminPlansPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const res = await getAllPlans(query);

  const plans = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Subscription Plans"
          description="Configure pricing packages, plot/calculation limits, and feature sets for users."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-wrap items-center gap-2.5 w-full sm:w-auto">
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search plans by name or code..."
            className="w-full sm:w-72"
          />
          <PlanFormModal />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable
        data={plans}
        columns={planColumns}
        meta={meta}
      />
    </div>
  );
}
