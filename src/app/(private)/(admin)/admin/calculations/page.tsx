
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import {
  calculationColumns,
  type CalculationRow,
} from "./_components/calculation-column";

const Calculations: CalculationRow[] = [
  {
    id: "c-001",
    projectName: "Shoti pukur",
    userName: "Raj Roy",
    userEmail: "rajroyraj2007@gmail.com",
    scale: "1:0.6",
    plots: 1,
    created: "২২ দিন আগে",
  },
  {
    id: "c-002",
    projectName: "Porojpur",
    userName: "Raj Roy",
    userEmail: "rajroyraj2007@gmail.com",
    scale: "1:2.3",
    plots: 1,
    created: "২৩ দিন আগে",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-end sm:flex-row">
        <SectionHeading
          title="Saved Calculations"
          description="Review saved land measurement, division and conversion records."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <SearchInput
          filterKey="projectName"
          placeholder="Search calculations..."
        />
      </div>
      <DataTable data={Calculations} columns={calculationColumns} />
    </div>
  );
}
