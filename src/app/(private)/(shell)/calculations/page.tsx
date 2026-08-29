import Link from "next/link";
import { ArrowRight, Calculator } from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { DataTable } from "@/components/common/data-table";
import { SearchInput } from "@/components/common/search-input";
import { getCalculations } from "@/services/calculation.service";
import { calculationColumns } from "./_components/calculation-column";
import { TSearchParams } from "@/interface/global";

export default async function Page({
  searchParams,
}: {
  searchParams: TSearchParams;
}) {
  const query = await searchParams;
  const res = await getCalculations(query);
  const calculations = res.success && res.data ? res.data : [];
  const meta = res.success ? res.meta : undefined;

  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <div className="flex flex-col justify-between items-start sm:items-end gap-4 sm:flex-row">
          <SectionHeading
            title="সংরক্ষিত ক্যালকুলেশন"
            description="আপনার সংরক্ষিত জমি পরিমাপ ও দাগের হিসাবসমূহ পর্যালোচনা করুন।"
            as="h3"
            alignment="left"
            constrain={false}
          />

          <SearchInput placeholder="নাম বা ম্যাপ খুঁজুন..." />
        </div>

        {calculations.length === 0 ? (
          <div className="rounded-xl border border-dashed p-10 text-center space-y-3 bg-muted/20">
            <Calculator className="size-10 mx-auto text-muted-foreground/60" />
            <h4 className="text-base font-semibold text-foreground">
              {query.searchTerm
                ? `"${query.searchTerm}" এর সাথে মিল রেখে কোনো ক্যালকুলেশন পাওয়া যায়নি`
                : "এখনও কোনো ক্যালকুলেশন সংরক্ষণ করা হয়নি"}
            </h4>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto">
              {query.searchTerm
                ? "ভিন্ন কোনো নাম বা ম্যাপ ফাইলের নাম দিয়ে আবার অনুসন্ধান করুন।"
                : "টুলসে গিয়ে ম্যাপ আপলোড করে প্লট আঁকুন এবং পরিমাপ সেভ করুন।"}
            </p>
          </div>
        ) : (
          <DataTable
            data={calculations}
            columns={calculationColumns}
            meta={meta}
          />
        )}

        <Link
          href="/tools/land-measurement"
          className="flex items-center justify-between rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50 group"
        >
          <div>
            <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
              পরিমাপ টুলস খুলুন
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              নতুন জমি ক্যালকুলেশন ও প্লট ড্রয়িং শুরু করুন।
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground group-hover:text-primary transition-colors group-hover:translate-x-1 duration-200" />
        </Link>
      </div>
    </PageWrapper>
  );
}
