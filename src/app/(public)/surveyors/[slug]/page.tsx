import { Button } from "@/components/ui/button";
import Link from "next/link";
import { PageWrapper } from "@/components/ui/custom/page-wrapper";
import type { TSurveyorProfile } from "@/types/surveyor-profile.type";
import { SurveyorHero } from "@/components/surveyors/surveyor-hero";
import { SurveyorStatsPanel } from "@/components/surveyors/surveyor-stats-panel";
import { SurveyorServices } from "@/components/surveyors/surveyor-services";
import { SurveyorServiceAreas } from "@/components/surveyors/surveyor-service-areas";
import { SurveyorPricing } from "@/components/surveyors/surveyor-pricing";
import { SurveyorVerification } from "@/components/surveyors/surveyor-verification";
import { SurveyorReviews } from "@/components/surveyors/surveyor-reviews";
import CustomBreadcrumb from "@/components/ui/custom/custom-breadcrumb";

// ─── Mock data ───────────────────────────────────────────
const mockSurveyors: Record<string, TSurveyorProfile> = {
  "md-abdul-karim": {
    id: "surveyor-001",
    slug: "md-abdul-karim",
    fullName: "মো. আব্দুল করিম",
    profilePhoto: "/images/surveyors/abdul-karim.webp",
    headline: "জমি পরিমাপ ও সীমানা নির্ধারণে অভিজ্ঞ সার্ভেয়ার",
    bio: "আমি দিনাজপুর সদর ও আশপাশের এলাকায় দীর্ঘদিন ধরে জমি পরিমাপ, সীমানা নির্ধারণ, জমি ভাগ-বাটোয়ারা এবং পরিমাপ রিপোর্ট প্রস্তুতের কাজ করে আসছি। কাজের প্রতিটি ধাপ সহজ ভাষায় বুঝিয়ে দেওয়ার চেষ্টা করি।",
    isVerified: true,
    experienceYears: 8,
    joinedAt: "2026-01-12T10:30:00.000Z",
    primaryLocation: {
      district: "দিনাজপুর",
      upazila: "দিনাজপুর সদর",
    },
    serviceAreas: [
      {
        district: "দিনাজপুর",
        upazilas: ["দিনাজপুর সদর", "বিরল", "কাহারোল", "বোচাগঞ্জ"],
      },
      {
        district: "ঠাকুরগাঁও",
        upazilas: ["ঠাকুরগাঁও সদর"],
      },
    ],
    services: [
      {
        id: "service-001",
        slug: "land-measurement",
        name: "জমি পরিমাপ",
        startingPrice: 3500,
      },
      {
        id: "service-002",
        slug: "land-division",
        name: "জমি ভাগ",
        startingPrice: 5000,
      },
      {
        id: "service-003",
        slug: "boundary-determination",
        name: "সীমানা নির্ধারণ",
        startingPrice: 3000,
      },
      {
        id: "service-004",
        slug: "survey-report",
        name: "পরিমাপ রিপোর্ট তৈরি",
        startingPrice: 2000,
      },
      {
        id: "service-005",
        slug: "digital-survey",
        name: "ডিজিটাল সার্ভে",
        startingPrice: 6000,
      },
      {
        id: "service-006",
        slug: "khatian-search",
        name: "খতিয়ান অনুসন্ধান",
        startingPrice: 1500,
      },
    ],
    rating: 4.8,
    totalReviews: 3,
    whatsappNumber: "8801712345678",
    completedRequests: 128,
    verification: {
      identityReviewed: true,
      professionalInformationReviewed: true,
      verifiedAt: "2026-01-18T09:15:00.000Z",
      note: "পরিচয় ও জমা দেওয়া professional তথ্য Mouza Map Pro কর্তৃক review করা হয়েছে। এটি সরকারি certification নয়।",
    },
    reviews: [
      {
        id: "review-001",
        reviewerName: "রহিম উদ্দিন",
        rating: 5,
        comment:
          "সময়মতো এসে জমির পরিমাপ করেছেন এবং পুরো হিসাবটি সহজভাবে বুঝিয়ে দিয়েছেন।",
        serviceName: "জমি পরিমাপ",
        createdAt: "2026-06-18T14:20:00.000Z",
        isVerifiedService: true,
      },
      {
        id: "review-002",
        reviewerName: "মো. কামাল হোসেন",
        rating: 4,
        comment:
          "কাজ ভালো হয়েছে। সীমানার বিষয়গুলো পরিষ্কারভাবে দেখিয়ে দিয়েছেন।",
        serviceName: "সীমানা নির্ধারণ",
        createdAt: "2026-05-27T11:40:00.000Z",
        isVerifiedService: true,
      },
      {
        id: "review-003",
        reviewerName: "সাবিনা ইয়াসমিন",
        rating: 5,
        comment:
          "পারিবারিক জমি ভাগের হিসাব এবং রিপোর্ট সুন্দরভাবে তৈরি করে দিয়েছেন।",
        serviceName: "জমি ভাগ",
        createdAt: "2026-04-09T16:10:00.000Z",
        isVerifiedService: true,
      },
    ],
  },
};

// ─── Page ──────────────────────────────────────────────────
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const surveyor = mockSurveyors[slug];

  if (!surveyor) {
    return (
      <PageWrapper>
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-muted-foreground">সার্ভেয়ার খুঁজে পাওয়া যায়নি</p>
          <Button className="mt-4" nativeButton={false} render={<Link href="/surveyors" />}>
            সার্ভেয়ার তালিকায় ফিরুন
          </Button>
        </div>
      </PageWrapper>
    );
  }

  return (
    <PageWrapper className="space-y-6" paddingSize="small">
      <CustomBreadcrumb
        links={[
          { name: "হোম", href: "/" },
          { name: "সার্ভেয়ার", href: "/surveyors" },
          { name: surveyor.fullName, isCurrent: true },
        ]}
      />

      <SurveyorHero surveyor={surveyor} />

      <SurveyorStatsPanel surveyor={surveyor} />

      <div className="grid gap-8 lg:grid-cols-3">
        <div className="space-y-8 lg:col-span-2">
          <SurveyorServices services={surveyor.services} />
          <SurveyorServiceAreas serviceAreas={surveyor.serviceAreas} />
        </div>
        <div className="space-y-6">
          <SurveyorPricing surveyor={surveyor} />
          <SurveyorVerification verification={surveyor.verification} />
        </div>
      </div>

      <SurveyorReviews
        reviews={surveyor.reviews}
        totalReviews={surveyor.totalReviews}
      />
    </PageWrapper>
  );
}
