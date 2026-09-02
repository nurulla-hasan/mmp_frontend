import type { Metadata } from "next";
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
import { getMe } from "@/services/auth.service";
import { getSurveyorBySlug } from "@/services/surveyor.service";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const surveyorRes = await getSurveyorBySlug(slug);

  if (!surveyorRes.success || !surveyorRes.data) {
    return {
      title: "সার্ভেয়ার পাওয়া যায়নি",
      description: "এই সার্ভেয়ার প্রোফাইলটি খুঁজে পাওয়া যায়নি।",
    };
  }

  const s = surveyorRes.data;
  const name = s.user?.name || s.fullName || "সার্ভেয়ার";
  const bio = s.bio || `${name} — অভিজ্ঞ এবং ভেরিফাইড পেশাদার আমিন/সার্ভেয়ার। জমি পরিমাপ, খতিয়ান যাচাই ও সার্ভে সেবা প্রদান করেন।`;
  const avatar = s.user?.imageUrl;

  return {
    title: `${name} — ভেরিফাইড সার্ভেয়ার ও আমিন`,
    description: bio.slice(0, 160),
    keywords: [
      name,
      "সার্ভেয়ার",
      "আমিন",
      "জমি পরিমাপক",
      "ভেরিফাইড সার্ভেয়ার প্রোফাইল",
      "Mouza Map Pro Surveyor",
    ],
    alternates: {
      canonical: `/surveyors/${slug}`,
    },
    openGraph: {
      title: `${name} — ভেরিফাইড সার্ভেয়ার ও আমিন | Mouza Map Pro`,
      description: bio.slice(0, 160),
      url: `/surveyors/${slug}`,
      images: avatar ? [{ url: avatar, alt: name }] : [],
    },
    twitter: {
      card: "summary",
      title: `${name} — ভেরিফাইড সার্ভেয়ার ও আমিন`,
      description: bio.slice(0, 160),
      images: avatar ? [avatar] : [],
    },
  };
}

export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const [surveyorRes, meRes] = await Promise.all([
    getSurveyorBySlug(slug),
    getMe(),
  ]);

  const surveyor = surveyorRes.success ? surveyorRes.data : null;
  const currentUser = meRes.success ? meRes.data.user : null;

  if (!surveyor) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <h2 className="text-xl font-bold">সার্ভেয়ার খুঁজে পাওয়া যায়নি</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            এই লিংকের সার্ভেয়ার প্রোফাইলটি সক্রিয় নেই অথবা মুছে ফেলা হয়েছে।
          </p>
          <Button className="mt-4" render={<Link href="/surveyors" />}>
            সার্ভেয়ার তালিকায় ফিরুন
          </Button>
        </div>
      </PageWrapper>
    );
  }

  const fullName = surveyor.user?.name || surveyor.fullName || "সার্ভেয়ার";
  const surveyorUserId = surveyor.user?.id || surveyor.userId;

  // JSON-LD Person schema for the surveyor
  const personJsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: fullName,
    jobTitle: "Land Surveyor / আমিন",
    description: surveyor.bio || undefined,
    image: surveyor.user?.imageUrl || undefined,
    telephone: surveyor.user?.phone || undefined,
    email: surveyor.user?.email || undefined,
  };

  return (
    <PageWrapper className="space-y-6" paddingSize="small">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(personJsonLd) }}
      />

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
          <SurveyorVerification verification={surveyor.verification} />
          <SurveyorReviews
            surveyorProfileId={surveyor.id}
            surveyorSlug={slug}
            surveyorUserId={surveyorUserId}
            reviews={surveyor.reviews}
            totalReviews={surveyor.totalReviews ?? surveyor.reviews?.length}
            services={surveyor.surveyorServices}
            currentUser={currentUser}
          />
        </div>

        <div className="space-y-6">
          <SurveyorPricing surveyor={surveyor} />
        </div>
      </div>
    </PageWrapper>
  );
}
