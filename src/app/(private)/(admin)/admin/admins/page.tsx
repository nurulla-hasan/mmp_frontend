import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { adminColumns, type AdminRow } from "./_components/admin-column";

const Admins: AdminRow[] = [
  {
    id: "a-001",
    name: "সুপার অ্যাডমিন",
    email: "super@mouzamappro.com",
    role: "SUPER_ADMIN",
  },
  {
    id: "a-002",
    name: "মো. রফিক",
    email: "rafiq@mouzamappro.com",
    role: "ADMIN",
  },
  {
    id: "a-003",
    name: "সালমা খাতুন",
    email: "salma@mouzamappro.com",
    role: "MODERATOR",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-end sm:flex-row">
        <SectionHeading
          title="Admin Management"
          description="Manage platform admins, their roles and access permissions."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <SearchInput filterKey="name" placeholder="Search admins..." />
      </div>
      <DataTable data={Admins} columns={adminColumns} />
    </div>
  );
}
