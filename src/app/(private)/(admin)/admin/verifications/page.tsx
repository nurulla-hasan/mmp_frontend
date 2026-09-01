import { getVerificationRequests } from "@/services/verification.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { verificationColumns } from "./_components/verification-column";
import { VerificationStatusFilter } from "./_components/verification-status-filter";
import type { TVerificationQuery } from "@/interface/verification";

interface PageProps {
  searchParams: Promise<TVerificationQuery>;
}

export default async function VerificationRequestsPage({
  searchParams,
}: PageProps) {
  const query = await searchParams;
  const res = await getVerificationRequests(query);

  const requests = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Verification Requests"
          description="Review applicant identities, surveying licenses, and professional credentials."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <VerificationStatusFilter />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by name, email, or phone..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable
        data={requests}
        columns={verificationColumns}
        meta={meta}
      />
    </div>
  );
}
