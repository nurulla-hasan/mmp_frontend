import { getUsers } from "@/services/user.service";
import { getMe } from "@/services/auth.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { adminColumns } from "./_components/admin-column";
import { AdminModal } from "./_components/admin-modal";
import type { TUserQuery } from "@/interface/user";

interface PageProps {
  searchParams: Promise<TUserQuery>;
}

export default async function AdminManagementPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const [res, meRes] = await Promise.all([
    getUsers({ ...query, role: "ADMIN" }),
    getMe(),
  ]);

  const admins = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;
  const isSuperAdmin =
    meRes.success && meRes.data?.user?.role === "SUPER_ADMIN";

  return (
    <div className="space-y-6">
      {/* Top Header & Search Bar */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Admin Management"
          description="Manage platform administrators and administrative access."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {isSuperAdmin && <AdminModal />}
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by name, email, or phone..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination and tableMeta */}
      <DataTable
        data={admins}
        columns={adminColumns}
        meta={meta}
        tableMeta={{ isSuperAdmin: !!isSuperAdmin }}
      />
    </div>
  );
}
