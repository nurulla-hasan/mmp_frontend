"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/ui/custom/page-wrapper";
import { SectionHeading } from "@/components/home/section-heading";
import { SearchInput } from "@/components/ui/custom/search-input";
import {
  SurveyorCard,
  type TSurveyorCard,
} from "@/components/surveyors/surveyor-card";
import { useNextFilter } from "@/hooks/useNextFilter";

const surveyors: TSurveyorCard[] = [
  {
    id: "surveyor-001",
    slug: "md-abdul-karim",
    fullName: "মো. আব্দুল করিম",
    isVerified: true,
    isSubscribed: true,
    experienceYears: 8,
    rating: 4.8,
    totalReviews: 42,
    primaryLocation: {
      district: "দিনাজপুর",
      upazila: "দিনাজপুর সদর",
    },
    services: [
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
      { id: "s-003", slug: "boundary-identification", name: "সীমানা নির্ধারণ" },
      { id: "s-006", slug: "survey-report", name: "পরিমাপ রিপোর্ট" },
    ],
    startingPrice: 3500,
  },
  {
    id: "surveyor-002",
    slug: "rahim-uddin",
    fullName: "রহিম উদ্দিন",
    isVerified: true,
    isSubscribed: true,
    experienceYears: 12,
    rating: 4.6,
    totalReviews: 78,
    primaryLocation: {
      district: "ঠাকুরগাঁও",
      upazila: "ঠাকুরগাঁও সদর",
    },
    services: [
      { id: "s-004", slug: "digital-survey", name: "ডিজিটাল সার্ভে" },
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
    ],
    startingPrice: 4000,
  },
  {
    id: "surveyor-003",
    slug: "nasima-akter",
    fullName: "নাসিমা আক্তার",
    isVerified: true,
    isSubscribed: false,
    experienceYears: 5,
    rating: 4.3,
    totalReviews: 19,
    primaryLocation: {
      district: "নীলফামারী",
      upazila: "সৈয়দপুর",
    },
    services: [
      { id: "s-005", slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা" },
      { id: "s-002", slug: "land-division", name: "জমি ভাগ" },
      { id: "s-007", slug: "record-verification", name: "রেকর্ড যাচাই" },
    ],
    startingPrice: 2500,
  },
  {
    id: "surveyor-004",
    slug: "kabir-hossain",
    fullName: "কবির হোসেন",
    isVerified: true,
    isSubscribed: false,
    experienceYears: 15,
    rating: 4.9,
    totalReviews: 134,
    primaryLocation: {
      district: "দিনাজপুর",
      upazila: "বিরামপুর",
    },
    services: [
      { id: "s-003", slug: "boundary-identification", name: "সীমানা নির্ধারণ" },
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
    ],
    startingPrice: 5000,
  },
  {
    id: "surveyor-005",
    slug: "fariha-yasmin",
    fullName: "ফারিহা ইয়াসমিন",
    isVerified: true,
    isSubscribed: true,
    experienceYears: 6,
    rating: 4.5,
    totalReviews: 31,
    primaryLocation: {
      district: "পঞ্চগড়",
      upazila: "পঞ্চগড় সদর",
    },
    services: [
      { id: "s-007", slug: "record-verification", name: "রেকর্ড যাচাই" },
      { id: "s-005", slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা" },
      { id: "s-002", slug: "land-division", name: "জমি ভাগ" },
    ],
    startingPrice: 3000,
  },
  {
    id: "surveyor-006",
    slug: "shahidul-islam",
    fullName: "শহীদুল ইসলাম",
    isVerified: true,
    isSubscribed: false,
    experienceYears: 3,
    rating: 4.1,
    totalReviews: 8,
    primaryLocation: {
      district: "দিনাজপুর",
      upazila: "ঘোড়াঘাট",
    },
    services: [
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
      { id: "s-006", slug: "survey-report", name: "পরিমাপ রিপোর্ট" },
    ],
    startingPrice: 2000,
  },
];

export default function Page() {
  const { getFilter } = useNextFilter();
  const searchTerm = getFilter("searchTerm")?.toLowerCase() ?? "";

  const filteredSurveyors = useMemo(() => {
    if (!searchTerm) return surveyors;

    return surveyors.filter((s) => {
      const nameMatch = s.fullName.toLowerCase().includes(searchTerm);
      const locationMatch =
        `${s.primaryLocation.district} ${s.primaryLocation.upazila}`
          .toLowerCase()
          .includes(searchTerm);
      const serviceMatch = s.services.some((svc) =>
        svc.name.toLowerCase().includes(searchTerm),
      );

      return nameMatch || locationMatch || serviceMatch;
    });
  }, [searchTerm]);

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
            {filteredSurveyors.length} টি সার্ভেয়ার পাওয়া গেছে
          </p>
        </div>

        <section className="grid gap-5 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 md:gap-6">
          {filteredSurveyors.length > 0 ? (
            filteredSurveyors.map((surveyor) => (
              <SurveyorCard key={surveyor.id} surveyor={surveyor} />
            ))
          ) : (
            <div className="col-span-full py-12 text-center text-muted-foreground">
              কোনো সার্ভেয়ার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে ভিন্ন শব্দে
              অনুসন্ধান করুন।
            </div>
          )}
        </section>
    </PageWrapper>
  );
}
