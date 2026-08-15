"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
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
      <SectionHeading
        title="Admin Management"
        description="Manage platform admins, their roles and access permissions."
        as="h3"
        alignment="left"
      />
      <DataTable
        data={Admins}
        columns={adminColumns}
        searchKey="name"
        searchPlaceholder="Search admins..."
      />
    </div>
  );
}
