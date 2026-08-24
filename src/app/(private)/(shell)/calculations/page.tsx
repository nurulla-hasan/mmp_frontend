import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { DataTable } from "@/components/common/data-table";
import {
  calculationColumns,
  type CalculationRow,
} from "./_components/calculation-column";
import { SearchInput } from "@/components/common/search-input";

const calculations: CalculationRow[] = [
  {
    id: "c-001",
    name: "Monipur 01",
    date: "২৩ আগস্ট ২০২৬",
    mapName: "202 Monipur.pdf",
    scale: "১ পিক্সেল ≈ 2.35 ফুট",
    totalPlots: 1,
  },
  {
    id: "c-002",
    name: "Monipur 02",
    date: "২১ আগস্ট ২০২৬",
    mapName: "198 Monipur.pdf",
    scale: "১ পিক্সেল ≈ 2.10 ফুট",
    totalPlots: 3,
  },
  {
    id: "c-003",
    name: "Dhanmondi Block C",
    date: "১৮ আগস্ট ২০২৬",
    mapName: "Dhanmondi_C.pdf",
    scale: "১ পিক্সেল ≈ 1.85 ফুট",
    totalPlots: 5,
  },
  {
    id: "c-004",
    name: "Uttara Sector 4",
    date: "১৫ আগস্ট ২০২৬",
    mapName: "Uttara_S4.pdf",
    scale: "১ পিক্সেল ≈ 3.00 ফুট",
    totalPlots: 2,
  },
];

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <div className="flex flex-col justify-between items-end sm:flex-row">
          <SectionHeading
            title="সংরক্ষিত ক্যালকুলেশন"
            description="সংরক্ষিত জমি পরিমাপ, ভাগ ও রূপান্তর পর্যালোচনা করুন।"
            as="h3"
            alignment="left"
            constrain={false}
          />

          <SearchInput placeholder="নাম বা ম্যাপ খুঁজুন..." />
        </div>

        <DataTable data={calculations} columns={calculationColumns} />

        <Link
          href="/tools"
          className="flex items-center justify-between rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50"
        >
          <div>
            <p className="text-sm text-muted-foreground">টুলস খুলুন</p>
            <p className="mt-2 text-sm text-muted-foreground">
              নতুন জমি ক্যালকুলেশন তৈরি করুন।
            </p>
          </div>
          <ArrowRight className="size-4 text-muted-foreground" />
        </Link>
      </div>
    </PageWrapper>
  );
}
