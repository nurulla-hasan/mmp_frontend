import type { TSearchParams } from "@/interface/global";
import { Badge } from "@/components/ui/badge";
import { PageWrapper } from "@/components/common/page-wrapper";
import { SearchInput } from "@/components/common/search-input";
import { ActiveFilterChips } from "./_components/active-filter-chips";
import { SurveyorCard } from "./_components/surveyor-card";
import { SurveyorFilter } from "./_components/surveyor-filter";
import {
  getAllSurveyors,
  getDistricts,
  getServices,
} from "@/services/auth.service";
import CustomPagination from "@/components/common/custom-pagination";

export default async function Page({
  searchParams,
}: {
  searchParams: TSearchParams;
}) {
  const params = await searchParams;

  // ------ Fetch filtered data from API ------
  const [surveyorsRes, districtsRes, servicesRes] = await Promise.allSettled([
    getAllSurveyors(params),
    getDistricts(),
    getServices(),
  ]);

  const surveyors =
    surveyorsRes.status === "fulfilled" && surveyorsRes.value.success
      ? surveyorsRes.value.data
      : [];

  const districts =
    districtsRes.status === "fulfilled" && districtsRes.value.success
      ? districtsRes.value.data
      : [];

  const services =
    servicesRes.status === "fulfilled" && servicesRes.value.success
      ? servicesRes.value.data
      : [];

  const meta =
    surveyorsRes.status === "fulfilled" && surveyorsRes.value.success
      ? surveyorsRes.value.meta
      : undefined;

  const total = meta?.total ?? surveyors.length;
  const currentPage =
    meta?.page ??
    (typeof params.page === "string" ? parseInt(params.page, 10) || 1 : 1);
  const totalPages = meta?.totalPages ?? 1;

  return (
    <PageWrapper className="space-y-5" paddingSize="small">
      {/* ── Sleek Marketplace Toolbar ─────────────────────── */}
      <div className="flex flex-col gap-3.5 sm:flex-row sm:items-center sm:justify-between border-b border-border/40 pb-4">
        <div className="flex items-center gap-2.5">
          <h1 className="text-lg font-bold font-heading md:text-xl text-primary">
            সার্ভেয়ার ডিরেক্টরি
          </h1>
          <Badge variant="secondary" className="px-2 py-0.5 text-xs font-normal">
            {total} জন প্রাপ্ত
          </Badge>
        </div>

        <div className="flex items-center gap-2.5">
          <SearchInput
            placeholder="নাম, এলাকা বা সেবা দিয়ে খুঁজুন..."
            className="w-full sm:w-64 md:w-72"
          />
          <SurveyorFilter
            districts={districts}
            services={services}
            totalResults={total}
          />
        </div>
      </div>

      {/* ── Active Filter Chips (if any) ───────────────────── */}
      <ActiveFilterChips districts={districts} services={services} />

      {/* ── Surveyor Cards Grid ────────────────────────────── */}
      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {surveyors.length > 0 ? (
          surveyors.map((surveyor) => (
            <SurveyorCard key={surveyor.id} surveyor={surveyor} />
          ))
        ) : (
          <div className="col-span-full rounded-2xl border border-dashed border-border/60 bg-muted/10 py-16 text-center text-muted-foreground">
            <p className="text-base font-medium text-foreground">
              কোনো সার্ভেয়ার খুঁজে পাওয়া যায়নি
            </p>
            <p className="mt-1 text-sm">
              অনুগ্রহ করে ভিন্ন শব্দে অনুসন্ধান করুন অথবা ফিল্টার রিসেট করুন।
            </p>
          </div>
        )}
      </section>

      {/* ── Pagination ─────────────────────────────────────── */}
      {totalPages > 1 && (
        <div className="pt-2">
          <CustomPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </PageWrapper>
  );
}
