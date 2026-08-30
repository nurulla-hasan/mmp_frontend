import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageWrapper } from "@/components/common/page-wrapper";
import { SurveyorHero } from "../_components/surveyor-hero";
import { SurveyorServices } from "../_components/surveyor-services";
import { SurveyorServiceAreas } from "../_components/surveyor-service-areas";
import { SurveyorPricing } from "../_components/surveyor-pricing";
import { SurveyorVerification } from "../_components/surveyor-verification";
import { SurveyorReviews } from "../_components/surveyor-reviews";
import CustomBreadcrumb from "@/components/common/custom-breadcrumb";
import { getSurveyorBySlug } from "@/services/auth.service";

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const result = await getSurveyorBySlug(slug);
  const surveyor = result.success ? result.data : null;

  if (!surveyor) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold">সার্ভেয়ার খুঁজে পাওয়া যায়নি</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            এই লিংকের সার্ভেয়ার প্রোফাইলটি সক্রিয় নেই অথবা মুছে ফেলা হয়েছে।
          </p>
          <Button className="mt-4" nativeButton={false} render={<Link href="/surveyors" />}>
            সার্ভেয়ার তালিকায় ফিরুন
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const fullName = surveyor.user?.name || surveyor.fullName || "সার্ভেয়ার";

  return (
    <PageWrapper className="space-y-6" paddingSize="small">
      <CustomBreadcrumb
        links={[
          { name: "হোম", href: "/" },
          { name: "সার্ভেয়ার", href: "/surveyors" },
          { name: fullName, isCurrent: true },
        ]}
      />

      <SurveyorHero surveyor={surveyor} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <SurveyorServices services={surveyor.surveyorServices} />
          <SurveyorServiceAreas serviceAreas={surveyor.serviceAreas} />
        </div>
        <div className="space-y-6">
          <SurveyorPricing surveyor={surveyor} />
          <SurveyorVerification verification={surveyor.verification} />
        </div>
      </div>

      <SurveyorReviews
        surveyorProfileId={surveyor.id}
        reviews={surveyor.reviews}
        totalReviews={surveyor.totalReviews}
        services={surveyor.surveyorServices}
      />
    </PageWrapper>
  );
}
