
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import {
  deviceLockColumns,
  type DeviceLockRow,
} from "./_components/device-lock-column";

const DeviceLocks: DeviceLockRow[] = [
  {
    id: "d-001",
    user: "কামাল হোসেন",
    device: "iPhone 14",
    reason: "Suspicious login",
    status: "locked",
    lockedAt: "2026-06-10T12:00:00.000Z",
  },
  {
    id: "d-002",
    user: "সাবিনা ইয়াসমিন",
    device: "Samsung Galaxy S22",
    reason: "Too many attempts",
    status: "locked",
    lockedAt: "2026-06-12T18:30:00.000Z",
  },
  {
    id: "d-003",
    user: "রহিম উদ্দিন",
    device: "Pixel 7",
    reason: "Manual unlock",
    status: "unlocked",
    lockedAt: "2026-05-28T09:00:00.000Z",
  },
];

export default function Page() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between items-end sm:flex-row">
        <SectionHeading
          title="Device Locks"
          description="Monitor and manage device-based access restrictions."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <SearchInput filterKey="user" placeholder="Search devices..." />
      </div>
      <DataTable data={DeviceLocks} columns={deviceLockColumns} />
    </div>
  );
}
