"use client";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import {
  serviceCategoryColumns,
  type ServiceCategoryRow,
} from "./_components/service-category-column";

const ServiceCategories: ServiceCategoryRow[] = [
  {
    id: "sc-001",
    name: "জমি পরিমাপ",
    slug: "land-measurement",
    status: "published",
  },
  {
    id: "sc-002",
    name: "সীমানা নির্ধারণ",
    slug: "boundary-marking",
    status: "published",
  },
  {
    id: "sc-003",
    name: "জমি ভাগ",
    slug: "land-division",
    status: "draft",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <SectionHeading
        title="Service Categories"
        description="Manage public land-service categories and descriptions."
        as="h3"
        alignment="left"
      />
      <DataTable
        data={ServiceCategories}
        columns={serviceCategoryColumns}
        searchKey="name"
        searchPlaceholder="Search categories..."
      />
    </div>
  );
}
