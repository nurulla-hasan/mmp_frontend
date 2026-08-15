"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import {
  verificationColumns,
  type VerificationRow,
} from "./_components/verification-column";

const Verifications: VerificationRow[] = [
  {
    id: "v-001",
    name: "মো. আব্দুল করিম",
    type: "Professional",
    status: "pending",
    submittedAt: "2026-05-10T11:20:00.000Z",
  },
  {
    id: "v-002",
    name: "জামাল উদ্দিন",
    type: "Identity",
    status: "approved",
    submittedAt: "2026-05-18T09:05:00.000Z",
  },
  {
    id: "v-003",
    name: "নাসিমা আক্তার",
    type: "Document",
    status: "rejected",
    submittedAt: "2026-06-02T16:40:00.000Z",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Verification Requests"
        description="Review identity and professional document submissions."
        as="h3"
        alignment="left"
      />
      <DataTable
        data={Verifications}
        columns={verificationColumns}
        searchKey="name"
        searchPlaceholder="Search requests..."
      />
    </div>
  );
}
