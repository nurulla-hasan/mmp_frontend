import { getUsers } from "@/services/user.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { userColumns } from "./_components/user-column";
import { UserFilters } from "./_components/user-filters";
import type { TUserQuery } from "@/interface/user";

interface PageProps {
  searchParams: Promise<TUserQuery>;
}

export default async function AdminUsersPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const res = await getUsers(query);

  const users = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Top Header & Filters Bar */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Users Management"
          description="Manage general users, professional surveyors, and platform administrators."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-wrap items-center gap-2.5 w-full lg:w-auto">
          <UserFilters />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by name, email, or phone..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable
        data={users}
        columns={userColumns}
        meta={meta}
      />
    </div>
  );
}
