import type { TSearchParams } from "@/interface/global";
import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { SurveyorCard } from "./_components/surveyor-card";
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
  const [surveyorsRes] = await Promise.allSettled([
    getAllSurveyors(params),
    getDistricts(),
    getServices(),
  ]);

  const surveyors =
    surveyorsRes.status === "fulfilled" && surveyorsRes.value.success
      ? surveyorsRes.value.data
      : [];

  const meta =
    surveyorsRes.status === "fulfilled" && surveyorsRes.value.success
      ? surveyorsRes.value.meta
      : undefined;

  const total = meta?.total;
  const currentPage = meta?.page ?? 1;
  const totalPages = meta?.totalPages ?? 1;

  return (
    <PageWrapper className="space-y-6" paddingSize="small">
      <SectionHeading
        title="আপনার এলাকার সার্ভেয়ার খুঁজুন"
        description="আপনার জমি জরিপ, সীমানা নির্ধারণ ও মৌজা ম্যাপের জন্য অভিজ্ঞ সার্ভেয়ার নির্বাচন করুন"
        as="h3"
        alignment="left"
      >
        <SearchInput placeholder="নাম, এলাকা বা সেবা অনুযায়ী খুঁজুন..." />
      </SectionHeading>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total} টি সার্ভেয়ার পাওয়া গেছে
        </p>
      </div>

      <section className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:gap-6 lg:grid-cols-3">
        {surveyors.length > 0 ? (
          surveyors.map((surveyor) => (
            <SurveyorCard key={surveyor.id} surveyor={surveyor} />
          ))
        ) : (
          <div className="col-span-full py-16 text-center text-muted-foreground">
            <p className="text-base font-medium">
              কোনো সার্ভেয়ার খুঁজে পাওয়া যায়নি।
            </p>
            <p className="mt-1 text-sm">
              অনুগ্রহ করে ভিন্ন শব্দে অনুসন্ধান করুন বা ফিল্টার পরিবর্তন করুন।
            </p>
          </div>
        )}
      </section>

      {totalPages > 1 && (
        <div className="pt-4">
          <CustomPagination currentPage={currentPage} totalPages={totalPages} />
        </div>
      )}
    </PageWrapper>
  );
}
