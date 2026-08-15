import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { PageWrapper } from "@/components/common/page-wrapper";

export default function Page() {
  return (
    <PageWrapper paddingSize="small">
      <div className="space-y-6">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold font-heading">সংরক্ষিত ক্যালকুলেশন</h1>
          <p className="text-muted-foreground">সংরক্ষিত জমি পরিমাপ, ভাগ ও রূপান্তর পর্যালোচনা করুন।</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="rounded-xl border bg-card p-5">
            <p className="text-sm text-muted-foreground">ক্যালকুলেশন ইতিহাস</p>
            <p className="mt-2 text-2xl font-semibold">0</p>
            <p className="mt-2 text-sm text-muted-foreground">সংরক্ষিত ক্যালকুলেশন এখানে দেখাবে।</p>
          </div>
          <Link href="/tools" className="rounded-xl border bg-card p-5 transition-colors hover:bg-accent/50">
            <p className="text-sm text-muted-foreground">টুলস খুলুন</p>
            <p className="mt-2 text-sm text-muted-foreground">নতুন জমি ক্যালকুলেশন তৈরি করুন।</p>
            <ArrowRight className="mt-4 size-4 text-muted-foreground" />
          </Link>
        </div>
      </div>
    </PageWrapper>
  );
}
