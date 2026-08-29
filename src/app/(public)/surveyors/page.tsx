"use client";

import { useMemo } from "react";
import { PageWrapper } from "@/components/common/page-wrapper";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import {
  SurveyorCard,
  type TSurveyorCard,
} from "./_components/surveyor-card";
import { useNextFilter } from "@/hooks/useNextFilter";

const surveyors: TSurveyorCard[] = [
  {
    id: "surveyor-001",
    slug: "md-abdul-karim",
    fullName: "মো. আব্দুল করিম",
    headline: "প্রত্যয়িত সার্ভেয়ার ও জমি জরিপ বিশেষজ্ঞ",
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
      { id: "s-001", serviceId: "svc-001", startingPrice: 3500, service: { slug: "land-measurement", name: "জমি পরিমাপ" } },
      { id: "s-002", serviceId: "svc-002", startingPrice: 5000, service: { slug: "land-division", name: "জমি ভাগ" } },
      { id: "s-003", serviceId: "svc-003", startingPrice: 3000, service: { slug: "boundary-determination", name: "সীমানা নির্ধারণ" } },
      { id: "s-004", serviceId: "svc-004", startingPrice: 2000, service: { slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি" } },
      { id: "s-005", serviceId: "svc-005", startingPrice: 6000, service: { slug: "digital-survey", name: "ডিজিটাল সার্ভে" } },
    ],
    whatsappNumber: "01712345678",
  },
  {
    id: "surveyor-002",
    slug: "rahim-uddin",
    fullName: "রহিম উদ্দিন",
    headline: "সিনিয়র জরিপকারী ও ভূমি ব্যবস্থাপনা বিশেষজ্ঞ",
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
      { id: "s-006", serviceId: "svc-006", startingPrice: 5000, service: { slug: "digital-survey", name: "ডিজিটাল সার্ভে" } },
      { id: "s-007", serviceId: "svc-007", startingPrice: 4000, service: { slug: "land-measurement", name: "জমি পরিমাপ" } },
      { id: "s-008", serviceId: "svc-008", startingPrice: 4500, service: { slug: "boundary-determination", name: "সীমানা নির্ধারণ" } },
      { id: "s-009", serviceId: "svc-009", startingPrice: 3000, service: { slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা" } },
      { id: "s-010", serviceId: "svc-010", startingPrice: 2000, service: { slug: "khatian-search", name: "খতিয়ান অনুসন্ধান" } },
      { id: "s-011", serviceId: "svc-011", startingPrice: 3500, service: { slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি" } },
    ],
    whatsappNumber: "01711122233",
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
      { id: "s-012", serviceId: "svc-012", startingPrice: 2500, service: { slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা" } },
      { id: "s-013", serviceId: "svc-013", startingPrice: 3000, service: { slug: "land-division", name: "জমি ভাগ" } },
      { id: "s-014", serviceId: "svc-014", startingPrice: 1500, service: { slug: "record-verification", name: "রেকর্ড যাচাই" } },
      { id: "s-015", serviceId: "svc-015", startingPrice: 2000, service: { slug: "land-measurement", name: "জমি পরিমাপ" } },
      { id: "s-016", serviceId: "svc-016", startingPrice: 1000, service: { slug: "khatian-search", name: "খতিয়ান অনুসন্ধান" } },
    ],
    whatsappNumber: "01912345678",
  },
  {
    id: "surveyor-004",
    slug: "kabir-hossain",
    fullName: "কবির হোসেন",
    headline: "এক্সপার্ট সার্ভেয়ার ও মৌজা ম্যাপ বিশ্লেষক",
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
      { id: "s-017", serviceId: "svc-017", startingPrice: 5000, service: { slug: "boundary-determination", name: "সীমানা নির্ধারণ" } },
      { id: "s-018", serviceId: "svc-018", startingPrice: 5000, service: { slug: "land-measurement", name: "জমি পরিমাপ" } },
      { id: "s-019", serviceId: "svc-019", startingPrice: 8000, service: { slug: "digital-survey", name: "ডিজিটাল সার্ভে" } },
      { id: "s-020", serviceId: "svc-020", startingPrice: 7000, service: { slug: "land-division", name: "জমি ভাগ" } },
      { id: "s-021", serviceId: "svc-021", startingPrice: 4000, service: { slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি" } },
      { id: "s-022", serviceId: "svc-022", startingPrice: 10000, service: { slug: "plot-layout", name: "প্লট লেআউট ও নকশা" } },
    ],
    whatsappNumber: "01312345678",
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
      { id: "s-023", serviceId: "svc-023", startingPrice: 2000, service: { slug: "record-verification", name: "রেকর্ড যাচাই" } },
      { id: "s-024", serviceId: "svc-024", startingPrice: 3000, service: { slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা" } },
      { id: "s-025", serviceId: "svc-025", startingPrice: 3500, service: { slug: "land-division", name: "জমি ভাগ" } },
      { id: "s-026", serviceId: "svc-026", startingPrice: 1500, service: { slug: "khatian-search", name: "খতিয়ান অনুসন্ধান" } },
      { id: "s-027", serviceId: "svc-027", startingPrice: 3000, service: { slug: "land-measurement", name: "জমি পরিমাপ" } },
    ],
    whatsappNumber: "01512345678",
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
      { id: "s-028", serviceId: "svc-028", startingPrice: 2000, service: { slug: "land-measurement", name: "জমি পরিমাপ" } },
      { id: "s-029", serviceId: "svc-029", startingPrice: 1500, service: { slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি" } },
      { id: "s-030", serviceId: "svc-030", startingPrice: 1800, service: { slug: "boundary-determination", name: "সীমানা নির্ধারণ" } },
      { id: "s-031", serviceId: "svc-031", startingPrice: 1000, service: { slug: "khatian-search", name: "খতিয়ান অনুসন্ধান" } },
    ],
    whatsappNumber: "01612345678",
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
        svc.service.name.toLowerCase().includes(searchTerm),
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
