import Link from "next/link";

import { Button } from "@/components/ui/button";

export function SurveyorBottomCTA({
  slug,
}: {
  slug: string;
}) {
  return (
    <section className="rounded-2xl border border-border bg-linear-to-br from-primary/5 to-transparent p-6 text-center md:p-8">
      <h2 className="text-lg font-semibold font-heading md:text-xl">
        এই সার্ভেয়ারের মাধ্যমে আপনার জমির কাজ সম্পন্ন করুন
      </h2>
      <p className="mt-2 text-muted-foreground md:text-base">
        কাজের বিবরণ দিন এবং বিনামূল্যে Quotation সংগ্রহ করুন
      </p>
      <div className="mt-5">
        <Button
          size="lg"
          nativeButton={false}
          render={
            <Link href={`/post-request?surveyor=${slug}`} />
          }
        >
          Quotation চান
        </Button>
      </div>
    </section>
  );
}
