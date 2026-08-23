
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { userColumns, type UserRow } from "./_components/user-column";

const Users: UserRow[] = [
  {
    id: "u-001",
    name: "রহিম উদ্দিন",
    email: "rahim.uddin@gmail.com",
    plotsMeasured: 12,
    role: "USER",
    status: "active",
  },
  {
    id: "u-002",
    name: "মো. আব্দুল করিম",
    email: "abdul.karim@yahoo.com",
    plotsMeasured: 47,
    role: "SURVEYOR",
    status: "active",
  },
  {
    id: "u-003",
    name: "সাবিনা ইয়াসমিন",
    email: "sabina.yasmin@gmail.com",
    plotsMeasured: 0,
    role: "USER",
    status: "blocked",
  },
  {
    id: "u-004",
    name: "কামাল হোসেন",
    email: "kamal.hossain@outlook.com",
    plotsMeasured: 8,
    role: "SURVEYOR",
    status: "pending",
  },
  {
    id: "u-005",
    name: "ফাতেমা বেগম",
    email: "fatema.begum@gmail.com",
    plotsMeasured: 23,
    role: "USER",
    status: "active",
  },
  {
    id: "u-006",
    name: "জামাল উদ্দিন আহমেদ",
    email: "jamal.ahmed@proton.me",
    plotsMeasured: 5,
    role: "SURVEYOR",
    status: "active",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-end sm:flex-row">
        <SectionHeading
          title="Users"
          description="Review general user accounts and platform activity."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <SearchInput filterKey="name" placeholder="Search users..." />
      </div>
      <DataTable data={Users} columns={userColumns} />
    </div>
  );
}
