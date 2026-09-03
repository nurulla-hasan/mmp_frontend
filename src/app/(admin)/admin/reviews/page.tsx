import { getAllReviews } from "@/services/review.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { reviewColumns } from "./_components/review-column";
import { ReviewStatusFilter } from "./_components/review-status-filter";
import type { TReviewQuery } from "@/interface/review";

interface PageProps {
  searchParams: Promise<TReviewQuery>;
}

export default async function AdminReviewsPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const res = await getAllReviews(query);

  const reviews = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
        <SectionHeading
          title="Reviews Management"
          description="Moderate, verify, and manage customer reviews for surveyors."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          <ReviewStatusFilter />
          <SearchInput
            filterKey="searchTerm"
            placeholder="Search by reviewer, comment, or surveyor..."
            className="w-full sm:w-72"
          />
        </div>
      </div>

      {/* TanStack Data Table with Server Pagination */}
      <DataTable
        data={reviews}
        columns={reviewColumns}
        meta={meta}
      />
    </div>
  );
}
