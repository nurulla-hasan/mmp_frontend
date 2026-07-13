import Link from "next/link";

import { Button } from "@/components/ui/button";
import type { TSurveyorProfile } from "@/types/surveyor-profile.type";

export function SurveyorPricing({
  surveyor,
}: {
  surveyor: TSurveyorProfile;
}) {
  return (
    <section className="rounded-xl border border-border bg-card p-5">
      <h2 className="text-sm font-semibold text-muted-foreground">
        মূল্য নির্ধারণ
      </h2>
      <div className="mt-3">
        {surveyor.pricingType === "QUOTATION_BASED" ? (
          <>
            <p className="text-base font-semibold text-primary">
              Quotation অনুযায়ী মূল্য
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              কাজের জটিলতা ও ভিন্নতা অনুসারে মূল্য নির্ধারণ করা হয়। সরাসরি
              সার্ভেয়ারের সাথে যোগাযোগ করে বিস্তারিত জেনে নিন।
            </p>
          </>
        ) : surveyor.startingPrice != null ? (
          <>
            <p className="text-base font-semibold text-primary">
              ৳{surveyor.startingPrice.toLocaleString("bn")} থেকে শুরু
            </p>
            <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
              মূল্য কাজের ধরণ ও এলাকা অনুযায়ী পরিবর্তিত হতে পারে।
            </p>
          </>
        ) : null}
      </div>
      <div className="mt-4">
        <Button
          className="w-full"
          nativeButton={false}
          render={
            <Link href={`/post-request?surveyor=${surveyor.slug}`} />
          }
        >
          Quotation চান
        </Button>
      </div>
    </section>
  );
}
