import { getAllPlans, getAutoProSetting } from "@/services/plan.service";
import { getSubscriptionHistory } from "@/services/subscriber.service";
import { DataTable } from "@/components/common/data-table";
import { SectionHeading } from "@/components/common/section-heading";
import { SearchInput } from "@/components/common/search-input";
import { planColumns } from "./_components/plan-column";
import { PlanFormModal } from "./_components/plan-form-modal";
import { AutoProToggleCard } from "./_components/auto-pro-toggle-card";
import { subscriberColumns } from "../subscribers/_components/subscriber-column";
import type { TPlanQuery } from "@/interface/plan";

interface PageProps {
  searchParams: Promise<TPlanQuery>;
}

export default async function AdminPlansPage({ searchParams }: PageProps) {
  const query = await searchParams;
  const [plansRes, autoProRes, historyRes] = await Promise.all([
    getAllPlans(query),
    getAutoProSetting(),
    getSubscriptionHistory(),
  ]);

  const plans = plansRes.success && plansRes.data ? plansRes.data : [];
  const meta = plansRes.success ? plansRes.meta : undefined;
  const autoProEnabled = autoProRes.success
    ? (autoProRes.data?.autoProOnRegister ?? true)
    : true;
  const autoProPlanId = autoProRes.success
    ? (autoProRes.data?.autoProPlanId ?? null)
    : null;

  const historyLogs = historyRes.success && historyRes.data ? historyRes.data : [];
  const historyMeta = historyRes.success ? historyRes.meta : undefined;

  return (
    <div className="space-y-10">
      {/* Auto-Grant Pro on Registration Control Banner */}
      <AutoProToggleCard
        initialEnabled={autoProEnabled}
        initialPlanId={autoProPlanId}
        plans={plans}
      />

      {/* Header & Controls */}
      <div className="space-y-6">
        <div className="flex flex-col justify-between items-start gap-4 lg:flex-row lg:items-end">
          <SectionHeading
            title="Subscription Plans"
            description="Configure pricing packages, plot/calculation limits, and feature sets for users."
            as="h3"
            alignment="left"
            constrain={false}
          />
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
            <PlanFormModal />
            <SearchInput
              filterKey="searchTerm"
              placeholder="Search plans by name or code..."
              className="w-full sm:w-72"
            />
          </div>
        </div>

        {/* TanStack Data Table with Server Pagination */}
        <DataTable
          data={plans}
          columns={planColumns}
          meta={meta}
        />
      </div>

      {/* Subscription Transaction & Activations History */}
      <div className="pt-8 border-t space-y-6">
        <SectionHeading
          title="Subscription History & Transactions Log"
          description="Complete chronological log of all package purchases, registrations bonuses, and manual activations."
          as="h3"
          alignment="left"
          constrain={false}
        />
        <DataTable
          data={historyLogs}
          columns={subscriberColumns}
          meta={historyMeta}
        />
      </div>
    </div>
  );
}
