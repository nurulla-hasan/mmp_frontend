"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import {
  subscriberColumns,
  type SubscriberRow,
} from "./_components/subscriber-column";

const Subscribers: SubscriberRow[] = [
  {
    id: "s-001",
    name: "Rakesh Roy",
    email: "rakeshroyraj2000@gmail.com",
    plan: "pro",
    expiresAt: "2026-12-31T00:00:00.000Z",
  },
  {
    id: "s-002",
    name: "munshiganj Cod",
    email: "cod2for@gmail.com",
    plan: "pro",
    expiresAt: "2026-12-31T00:00:00.000Z",
  },
  {
    id: "s-003",
    name: "Tonjib Kormokar",
    email: "tonjib.bsl@gmail.com",
    plan: "pro",
    expiresAt: "2026-12-31T00:00:00.000Z",
  },
  {
    id: "s-004",
    name: "রহিম উদ্দিন",
    email: "rahim.uddin@gmail.com",
    plan: "pro",
    expiresAt: "2026-09-12T00:00:00.000Z",
  },
  {
    id: "s-005",
    name: "ফাতেমা বেগম",
    email: "fatema.begum@gmail.com",
    plan: "pro",
    expiresAt: "2027-01-15T00:00:00.000Z",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Subscribers"
        description="Manage platform subscribers and their subscription status."
        as="h3"
        alignment="left"
      />
      <DataTable
        data={Subscribers}
        columns={subscriberColumns}
        searchKey="name"
        searchPlaceholder="Search subscribers..."
      />
    </div>
  );
}
