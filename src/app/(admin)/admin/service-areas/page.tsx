import { getDistricts } from "@/services/district.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { districtColumns } from "./_components/district-column";
import { DistrictModal } from "./_components/district-modal";
import type { TDistrictQuery } from "@/interface/district";

interface PageProps {
  searchParams: Promise<TDistrictQuery>;
}

export default async function AdminServiceAreasPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const res = await getDistricts();

  const allDistricts = res.success && res.data ? res.data : [];

  const rawSearch = query?.searchTerm;
  const searchTerm = typeof rawSearch === "string" ? rawSearch.toLowerCase().trim() : "";
  const filteredDistricts = searchTerm
    ? allDistricts.filter(
        (d) =>
          d.name.toLowerCase().includes(searchTerm) ||
          d.slug.toLowerCase().includes(searchTerm) ||
          d.upazilas.some((u) => u.toLowerCase().includes(searchTerm)),
      )
    : allDistricts;

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Service Areas Management"
          description="Manage districts and upazilas for surveyor coverage and service locations."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <DistrictModal actionType="create" />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search district or upazila..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table */}
      <DataTable
        data={filteredDistricts}
        columns={districtColumns}
      />
    </div>
  );
}

