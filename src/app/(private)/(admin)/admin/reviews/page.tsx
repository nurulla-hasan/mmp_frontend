"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { reviewColumns, type ReviewRow } from "./_components/review-column";

const Reviews: ReviewRow[] = [
  {
    id: "review-001",
    reviewerName: "রহিম উদ্দিন",
    rating: 5,
    comment:
      "সময়মতো এসে জমির পরিমাপ করেছেন এবং পুরো হিসাবটি সহজভাবে বুঝিয়ে দিয়েছেন।",
    serviceName: "জমি পরিমাপ",
    createdAt: "2026-06-18T14:20:00.000Z",
    isVerifiedService: true,
    status: "approved",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
  {
    id: "review-002",
    reviewerName: "মো. কামাল হোসেন",
    rating: 4,
    comment: "কাজ ভালো হয়েছে। সীমানার বিষয়গুলো পরিষ্কারভাবে দেখিয়ে দিয়েছেন।",
    serviceName: "সীমানা নির্ধারণ",
    createdAt: "2026-05-27T11:40:00.000Z",
    isVerifiedService: true,
    status: "approved",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
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
    status: "approved",
    surveyorName: "মো. আব্দুল করিম",
    surveyorSlug: "md-abdul-karim",
  },
];

export default function AdminReviewsPage() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Reviews"
        description="Verify and approve surveyor reviews."
        as="h3"
        alignment="left"
      />

      <DataTable data={Reviews} columns={reviewColumns}/>
    </div>
  );
}
