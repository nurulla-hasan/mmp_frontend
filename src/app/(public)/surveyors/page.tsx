"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/shared/page-wrapper";
import { SectionHeading } from "@/components/home/section-heading";
import { SectionWrapper } from "@/components/shared/section-wrapper";
import { SearchInput } from "@/components/ui/custom/search-input";
import { SurveyorCard, type TSurveyorCard } from "@/components/surveyors/surveyor-card";
import { useNextFilter } from "@/hooks/useNextFilter";

const surveyors: TSurveyorCard[] = [
  {
    id: "surveyor-001",
    slug: "md-abdul-karim",
    fullName: "মো. আব্দুল করিম",
    headline: "জমি পরিমাপ ও সীমানা নির্ধারণ বিশেষজ্ঞ",
    isVerified: true,
    experienceYears: 8,
    rating: 4.8,
    totalReviews: 42,
    completedRequests: 128,
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
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "surveyor-002",
    slug: "rahim-uddin",
    fullName: "রহিম উদ্দিন",
    headline: "ডিজিটাল সার্ভে ও ম্যাপিং বিশেষজ্ঞ",
    isVerified: true,
    experienceYears: 12,
    rating: 4.6,
    totalReviews: 78,
    completedRequests: 245,
    primaryLocation: {
      district: "ঠাকুরগাঁও",
      upazila: "ঠাকুরগাঁও সদর",
    },
    services: [
      { id: "s-004", slug: "digital-survey", name: "ডিজিটাল সার্ভে" },
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
    ],
    startingPrice: 4000,
    availabilityStatus: "BUSY",
  },
  {
    id: "surveyor-003",
    slug: "nasima-akter",
    fullName: "নাসিমা আক্তার",
    headline: "মৌজা ম্যাপ ও ভূমি রেকর্ড বিশ্লেষক",
    isVerified: false,
    experienceYears: 5,
    rating: 4.3,
    totalReviews: 19,
    completedRequests: 56,
    primaryLocation: {
      district: "নীলফামারী",
      upazila: "সৈয়দপুর",
    },
    services: [
      { id: "s-005", slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা" },
      { id: "s-002", slug: "land-division", name: "জমি ভাগ" },
      { id: "s-006", slug: "survey-report", name: "পরিমাপ রিপোর্ট" },
      { id: "s-007", slug: "record-verification", name: "রেকর্ড যাচাই" },
    ],
    startingPrice: 2500,
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "surveyor-004",
    slug: "kabir-hossain",
    fullName: "কবির হোসেন",
    headline: "সীমানা পিলার স্থাপন ও জমি জরিপ বিশেষজ্ঞ",
    isVerified: true,
    experienceYears: 15,
    rating: 4.9,
    totalReviews: 134,
    completedRequests: 412,
    primaryLocation: {
      district: "দিনাজপুর",
      upazila: "বিরামপুর",
    },
    services: [
      { id: "s-003", slug: "boundary-identification", name: "সীমানা নির্ধারণ" },
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
    ],
    startingPrice: 5000,
    availabilityStatus: "AVAILABLE",
  },
  {
    id: "surveyor-005",
    slug: "fariha-yasmin",
    fullName: "ফারিহা ইয়াসমিন",
    headline: "ভূমি রেকর্ড ও খতিয়ান বিশেষজ্ঞ",
    isVerified: true,
    experienceYears: 6,
    rating: 4.5,
    totalReviews: 31,
    completedRequests: 89,
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
    availabilityStatus: "UNAVAILABLE",
  },
  {
    id: "surveyor-006",
    slug: "shahidul-islam",
    fullName: "শহীদুল ইসলাম",
    headline: "জমি পরিমাপ ও রিপোর্ট প্রস্তুতকারক",
    isVerified: false,
    experienceYears: 3,
    rating: 4.1,
    totalReviews: 8,
    completedRequests: 24,
    primaryLocation: {
      district: "দিনাজপুর",
      upazila: "ঘোড়াঘাট",
    },
    services: [
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ" },
      { id: "s-006", slug: "survey-report", name: "পরিমাপ রিপোর্ট" },
    ],
    startingPrice: 2000,
    availabilityStatus: "AVAILABLE",
  },
];

export default function Page() {
  const { getFilter } = useNextFilter();
  const searchTerm = getFilter("searchTerm")?.toLowerCase() ?? "";

  const filteredSurveyors = useMemo(() => {
    if (!searchTerm) return surveyors;

    return surveyors.filter((s) => {
      const nameMatch = s.fullName.toLowerCase().includes(searchTerm);
      const locationMatch = `${s.primaryLocation.district} ${s.primaryLocation.upazila}`
        .toLowerCase()
        .includes(searchTerm);
      const serviceMatch = s.services.some((svc) =>
        svc.name.toLowerCase().includes(searchTerm),
      );
      const headlineMatch = s.headline.toLowerCase().includes(searchTerm);

      return nameMatch || locationMatch || serviceMatch || headlineMatch;
    });
  }, [searchTerm]);

  return (
    <>
      <SectionWrapper asSection bg="muted" padding="sm">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <SectionHeading
            badge="Surveyors"
            title="Find a Surveyor"
            description="Explore verified land surveyor profiles by service area, experience, equipment, availability, and reviews."
            alignment="left"
          />
          <SearchInput
            placeholder="নাম, এলাকা বা সেবা অনুযায়ী খুঁজুন..."
            className="shrink-0 sm:max-w-xs"
          />
        </div>
      </SectionWrapper>

      <PageWrapper>
        <section className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {filteredSurveyors.length > 0 ? (
          filteredSurveyors.map((surveyor) => (
            <SurveyorCard key={surveyor.id} surveyor={surveyor} />
          ))
        ) : (
          <div className="col-span-full py-12 text-center text-muted-foreground">
            কোনো সার্ভেয়ার খুঁজে পাওয়া যায়নি। অনুগ্রহ করে ভিন্ন শব্দে অনুসন্ধান করুন।
          </div>
        )}
      </section>
    </PageWrapper>
    </>
  );
}
