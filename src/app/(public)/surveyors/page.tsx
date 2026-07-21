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
      { id: "s-001", slug: "land-measurement", name: "জমি পরিমাপ", startingPrice: 3500 },
      { id: "s-002", slug: "land-division", name: "জমি ভাগ", startingPrice: 5000 },
      { id: "s-003", slug: "boundary-determination", name: "সীমানা নির্ধারণ", startingPrice: 3000 },
      { id: "s-004", slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি", startingPrice: 2000 },
      { id: "s-005", slug: "digital-survey", name: "ডিজিটাল সার্ভে", startingPrice: 6000 },
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
      { id: "s-006", slug: "digital-survey", name: "ডিজিটাল সার্ভে", startingPrice: 5000 },
      { id: "s-007", slug: "land-measurement", name: "জমি পরিমাপ", startingPrice: 4000 },
      { id: "s-008", slug: "boundary-determination", name: "সীমানা নির্ধারণ", startingPrice: 4500 },
      { id: "s-009", slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা", startingPrice: 3000 },
      { id: "s-010", slug: "khatian-search", name: "খতিয়ান অনুসন্ধান", startingPrice: 2000 },
      { id: "s-011", slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি", startingPrice: 3500 },
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
      { id: "s-012", slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা", startingPrice: 2500 },
      { id: "s-013", slug: "land-division", name: "জমি ভাগ", startingPrice: 3000 },
      { id: "s-014", slug: "record-verification", name: "রেকর্ড যাচাই", startingPrice: 1500 },
      { id: "s-015", slug: "land-measurement", name: "জমি পরিমাপ", startingPrice: 2000 },
      { id: "s-016", slug: "khatian-search", name: "খতিয়ান অনুসন্ধান", startingPrice: 1000 },
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
      { id: "s-017", slug: "boundary-determination", name: "সীমানা নির্ধারণ", startingPrice: 5000 },
      { id: "s-018", slug: "land-measurement", name: "জমি পরিমাপ", startingPrice: 5000 },
      { id: "s-019", slug: "digital-survey", name: "ডিজিটাল সার্ভে", startingPrice: 8000 },
      { id: "s-020", slug: "land-division", name: "জমি ভাগ", startingPrice: 7000 },
      { id: "s-021", slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি", startingPrice: 4000 },
      { id: "s-022", slug: "plot-layout", name: "প্লট লেআউট ও নকশা", startingPrice: 10000 },
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
      { id: "s-023", slug: "record-verification", name: "রেকর্ড যাচাই", startingPrice: 2000 },
      { id: "s-024", slug: "mouza-map", name: "মৌজা ম্যাপ সহায়তা", startingPrice: 3000 },
      { id: "s-025", slug: "land-division", name: "জমি ভাগ", startingPrice: 3500 },
      { id: "s-026", slug: "khatian-search", name: "খতিয়ান অনুসন্ধান", startingPrice: 1500 },
      { id: "s-027", slug: "land-measurement", name: "জমি পরিমাপ", startingPrice: 3000 },
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
      { id: "s-028", slug: "land-measurement", name: "জমি পরিমাপ", startingPrice: 2000 },
      { id: "s-029", slug: "survey-report", name: "পরিমাপ রিপোর্ট তৈরি", startingPrice: 1500 },
      { id: "s-030", slug: "boundary-determination", name: "সীমানা নির্ধারণ", startingPrice: 1800 },
      { id: "s-031", slug: "khatian-search", name: "খতিয়ান অনুসন্ধান", startingPrice: 1000 },
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
