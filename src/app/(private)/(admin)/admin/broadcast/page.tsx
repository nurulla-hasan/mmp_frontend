import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import {
  broadcastColumns,
  type BroadcastRow,
} from "./_components/broadcast-column";

const Broadcasts: BroadcastRow[] = [
  {
    id: "b-001",
    title: "নতুন Pro ফিচার চালু হয়েছে",
    message: "সকল ব্যবহারকারীর জন্য নতুন Pro ফিচার আপডেট করা হয়েছে।",
    active: true,
  },
  {
    id: "b-002",
    title: "সার্ভেয়ার ভেরিফিকেশন ক্যাম্পেইন",
    message: "সার্ভেয়ারদের ভেরিফিকেশন ড্রাইভ চলছে, আবেদন করুন।",
    active: true,
  },
  {
    id: "b-003",
    title: "রুটিন মেইনটেনেন্স নোটিশ",
    message: "সিস্টেম আপডেটের জন্য সাময়িক বিভ্রাট হতে পারে।",
    active: false,
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-end sm:flex-row">
        <SectionHeading
          title="Broadcast"
          description="Send announcements and notifications to users."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <SearchInput filterKey="title" placeholder="Search broadcasts..." />
      </div>
      <DataTable data={Broadcasts} columns={broadcastColumns} />
    </div>
  );
}
